from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os

app = Flask(__name__)
CORS(app, origins="*")

app.config['SECRET_KEY'] = 'campus-connect-secret-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///campus_connect.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ─── MODELS ──────────────────────────────────────────────────────────────────

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    coin_balance = db.Column(db.Integer, default=100)
    avatar_color = db.Column(db.String(20), default='#6C63FF')
    department = db.Column(db.String(100), default='')
    year = db.Column(db.String(20), default='')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'coin_balance': self.coin_balance,
            'avatar_color': self.avatar_color,
            'department': self.department,
            'year': self.year,
            'created_at': self.created_at.isoformat()
        }


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='General')
    coins = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='open')  # open, accepted, completed
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    accepted_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    creator = db.relationship('User', foreign_keys=[created_by], backref='created_tasks')
    acceptor = db.relationship('User', foreign_keys=[accepted_by], backref='accepted_tasks')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'coins': self.coins,
            'status': self.status,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else 'Unknown',
            'creator_avatar': self.creator.avatar_color if self.creator else '#6C63FF',
            'accepted_by': self.accepted_by,
            'acceptor_name': self.acceptor.name if self.acceptor else None,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    from_user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    to_user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'from_user': self.from_user,
            'to_user': self.to_user,
            'amount': self.amount,
            'task_id': self.task_id,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }

# ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    colors = ['#6C63FF', '#FF6584', '#43D9AD', '#F7B731', '#FC5C65', '#45AAF2', '#26DE81']
    import random
    color = random.choice(colors)

    user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        avatar_color=color,
        department=data.get('department', ''),
        year=data.get('year', '')
    )
    db.session.add(user)
    db.session.commit()

    # Welcome bonus transaction
    txn = Transaction(to_user=user.id, amount=100, description='Welcome bonus!')
    db.session.add(txn)
    db.session.commit()

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token, 'user': user.to_dict()}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing credentials'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token, 'user': user.to_dict()})


@app.route('/api/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify(current_user.to_dict())


@app.route('/api/me', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    if data.get('name'):
        current_user.name = data['name']
    if data.get('department'):
        current_user.department = data['department']
    if data.get('year'):
        current_user.year = data['year']
    db.session.commit()
    return jsonify(current_user.to_dict())

# ─── TASK ROUTES ──────────────────────────────────────────────────────────────

@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    status = request.args.get('status')
    category = request.args.get('category')
    mine = request.args.get('mine')  # 'created' or 'accepted'

    query = Task.query

    if mine == 'created':
        query = query.filter_by(created_by=current_user.id)
    elif mine == 'accepted':
        query = query.filter_by(accepted_by=current_user.id)
    else:
        # Open tasks not created by current user
        query = query.filter_by(status='open').filter(Task.created_by != current_user.id)

    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)

    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks])


@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user):
    data = request.get_json()
    if not data or not data.get('title') or not data.get('description') or not data.get('coins'):
        return jsonify({'error': 'Missing required fields'}), 400

    coins = int(data['coins'])
    if coins <= 0:
        return jsonify({'error': 'Coins must be positive'}), 400
    if current_user.coin_balance < coins:
        return jsonify({'error': 'Insufficient coin balance'}), 400

    task = Task(
        title=data['title'],
        description=data['description'],
        category=data.get('category', 'General'),
        coins=coins,
        created_by=current_user.id
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@app.route('/api/tasks/<int:task_id>', methods=['GET'])
@token_required
def get_task(current_user, task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())


@app.route('/api/tasks/<int:task_id>/accept', methods=['POST'])
@token_required
def accept_task(current_user, task_id):
    task = Task.query.get_or_404(task_id)

    if task.status != 'open':
        return jsonify({'error': 'Task is no longer available'}), 400
    if task.created_by == current_user.id:
        return jsonify({'error': 'Cannot accept your own task'}), 400

    task.accepted_by = current_user.id
    task.status = 'accepted'
    db.session.commit()
    return jsonify(task.to_dict())


@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
@token_required
def complete_task(current_user, task_id):
    task = Task.query.get_or_404(task_id)

    if task.status != 'accepted':
        return jsonify({'error': 'Task is not in accepted state'}), 400
    if task.created_by != current_user.id:
        return jsonify({'error': 'Only the requester can mark as complete'}), 403

    creator = User.query.get(task.created_by)
    acceptor = User.query.get(task.accepted_by)

    if creator.coin_balance < task.coins:
        return jsonify({'error': 'Insufficient coins for transfer'}), 400

    creator.coin_balance -= task.coins
    acceptor.coin_balance += task.coins

    task.status = 'completed'
    task.completed_at = datetime.datetime.utcnow()

    txn = Transaction(
        from_user=creator.id,
        to_user=acceptor.id,
        amount=task.coins,
        task_id=task.id,
        description=f'Payment for: {task.title}'
    )
    db.session.add(txn)
    db.session.commit()
    return jsonify(task.to_dict())


@app.route('/api/tasks/<int:task_id>/cancel', methods=['POST'])
@token_required
def cancel_task(current_user, task_id):
    task = Task.query.get_or_404(task_id)
    if task.created_by != current_user.id:
        return jsonify({'error': 'Only creator can cancel'}), 403
    if task.status == 'completed':
        return jsonify({'error': 'Cannot cancel completed task'}), 400

    task.status = 'cancelled'
    db.session.commit()
    return jsonify(task.to_dict())

# ─── STATS & TRANSACTIONS ─────────────────────────────────────────────────────

@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    created = Task.query.filter_by(created_by=current_user.id).count()
    accepted = Task.query.filter_by(accepted_by=current_user.id).count()
    completed_as_provider = Task.query.filter_by(accepted_by=current_user.id, status='completed').count()
    completed_as_requester = Task.query.filter_by(created_by=current_user.id, status='completed').count()
    open_tasks = Task.query.filter_by(status='open').filter(Task.created_by != current_user.id).count()

    return jsonify({
        'tasks_created': created,
        'tasks_accepted': accepted,
        'completed_as_provider': completed_as_provider,
        'completed_as_requester': completed_as_requester,
        'open_tasks_available': open_tasks,
        'coin_balance': current_user.coin_balance
    })


@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions(current_user):
    txns = Transaction.query.filter(
        (Transaction.from_user == current_user.id) | (Transaction.to_user == current_user.id)
    ).order_by(Transaction.created_at.desc()).limit(20).all()
    result = []
    for t in txns:
        d = t.to_dict()
        d['type'] = 'credit' if t.to_user == current_user.id else 'debit'
        result.append(d)
    return jsonify(result)


@app.route('/api/leaderboard', methods=['GET'])
@token_required
def leaderboard(current_user):
    users = User.query.order_by(User.coin_balance.desc()).limit(10).all()
    return jsonify([{
        'id': u.id,
        'name': u.name,
        'coin_balance': u.coin_balance,
        'avatar_color': u.avatar_color,
        'is_me': u.id == current_user.id
    } for u in users])


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Seed demo users if empty
        if not User.query.first():
            import random
            colors = ['#6C63FF', '#FF6584', '#43D9AD', '#F7B731', '#FC5C65']
            demo_users = [
                {'name': 'Arjun Sharma', 'email': 'arjun@campus.edu', 'department': 'Computer Science', 'year': '3rd Year'},
                {'name': 'Priya Patel', 'email': 'priya@campus.edu', 'department': 'Electronics', 'year': '2nd Year'},
                {'name': 'Rahul Gupta', 'email': 'rahul@campus.edu', 'department': 'Mechanical', 'year': '4th Year'},
            ]
            created_users = []
            for i, u in enumerate(demo_users):
                user = User(name=u['name'], email=u['email'],
                           password=generate_password_hash('demo123'),
                           coin_balance=150 + i*50,
                           avatar_color=colors[i],
                           department=u['department'], year=u['year'])
                db.session.add(user)
                db.session.flush()
                created_users.append(user)

            db.session.commit()

            # Seed tasks
            cats = ['Tutoring', 'Printing', 'Delivery', 'Notes', 'Tech Help', 'General']
            seed_tasks = [
                ('Math Tutoring – Calculus', 'Need help with integration and differentiation for upcoming exam. 2-hour session preferred.', 'Tutoring', 40),
                ('Print 20 pages A4', 'Need to print assignment, double-sided. Files ready on Google Drive.', 'Printing', 15),
                ('Deliver food from canteen', 'Stuck in lab, need someone to bring lunch from main canteen.', 'Delivery', 20),
                ('DSA Notes – Unit 3', 'Looking for handwritten or typed notes on Trees and Graphs.', 'Notes', 25),
                ('Fix my Python code', 'Getting a weird recursion error, need a CS student to review.', 'Tech Help', 30),
                ('Java assignment help', 'Need guidance on inheritance and polymorphism concepts.', 'Tutoring', 35),
            ]
            for i, (title, desc, cat, coins) in enumerate(seed_tasks):
                task = Task(title=title, description=desc, category=cat, coins=coins,
                           created_by=created_users[i % len(created_users)].id)
                db.session.add(task)
            db.session.commit()

    app.run(debug=True, port=5000)