import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskApi, statsApi } from '../utils/api';
import { Avatar, CoinBadge, StatusBadge, CategoryBadge } from '../components/UI';
import toast from 'react-hot-toast';
import { Edit3, Save, X, Coins, TrendingUp, CheckCircle, Star } from 'lucide-react';

const DEPTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Mathematics', 'Physics', 'MBA', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', year: user?.year || '' });
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posted');

  useEffect(() => {
    Promise.all([
      statsApi.get(),
      statsApi.transactions(),
      taskApi.getAll({ mine: 'created' }),
    ]).then(([s, t, tasks]) => {
      setStats(s.data);
      setTransactions(t.data);
      setMyTasks(tasks.data);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { authApi } = await import('../utils/api');
      await authApi.updateProfile(form);
      await refreshUser();
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const acceptedTasks = myTasks.filter(t => t.accepted_by);

  return (
    <div className="flex-1 p-6 lg:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Clash Display, sans-serif' }}>My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-5">
            <div className="glass rounded-2xl p-6 gradient-border">
              <div className="flex items-start justify-between mb-5">
                <Avatar name={user?.name || ''} color={user?.avatar_color} size="xl" />
                <button onClick={() => { setEditing(!editing); setForm({ name: user?.name, department: user?.department, year: user?.year }); }}
                  className="p-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}>
                  {editing ? <X size={16} /> : <Edit3 size={16} />}
                </button>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white mb-1 block font-medium">Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="input-dark w-full px-3 py-2 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-white mb-1 block font-medium">Department</label>
                    <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                      className="input-dark w-full px-3 py-2 rounded-xl text-sm cursor-pointer">
                      <option value="">Select</option>
                      {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white mb-1 block font-medium">Year</label>
                    <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}
                      className="input-dark w-full px-3 py-2 rounded-xl text-sm cursor-pointer">
                      <option value="">Select</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button onClick={handleSave} disabled={loading}
                    className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2">
                    <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-0.5">{user?.name}</h2>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                  {user?.department && <p className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>{user.department}</p>}
                  {user?.year && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.year}</p>}
                </>
              )}

              <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Coin Balance</div>
                <div className="text-3xl font-bold font-mono gradient-text">{user?.coin_balance || 0}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Campus Coins</div>
              </div>

              <div className="mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">My Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Tasks Posted', value: stats.tasks_created, icon: '📋', color: '#45AAF2' },
                    { label: 'Completed as Provider', value: stats.completed_as_provider, icon: '✅', color: '#43D9AD' },
                    { label: 'Completed as Requester', value: stats.completed_as_requester, icon: '🎯', color: '#6C63FF' },
                    { label: 'Tasks Accepted', value: stats.tasks_accepted, icon: '⚡', color: '#F7B731' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                      </div>
                      <span className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Transaction History */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Transaction History</h3>
              {transactions.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-secondary)' }}>No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/3"
                      style={{ border: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                          style={{ background: t.type === 'credit' ? 'rgba(67,217,173,0.15)' : 'rgba(255,101,132,0.15)' }}>
                          {t.type === 'credit' ? '↓' : '↑'}
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">{t.description}</div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(t.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold"
                        style={{ color: t.type === 'credit' ? '#43D9AD' : '#FF6584' }}>
                        {t.type === 'credit' ? '+' : '-'}{t.amount} 🪙
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task History */}
            <div className="glass rounded-2xl p-5">
              <div className="flex gap-3 mb-4">
                {['posted', 'accepted'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer capitalize`}
                    style={activeTab === t
                      ? { background: 'rgba(108,99,255,0.2)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }
                      : { color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'transparent' }
                    }>
                    {t === 'posted' ? '📋 Posted Tasks' : '⚡ Accepted Tasks'}
                  </button>
                ))}
              </div>

              {activeTab === 'posted' ? (
                myTasks.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--text-secondary)' }}>No tasks posted yet</p>
                ) : (
                  <div className="space-y-2">
                    {myTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-xl"
                        style={{ border: '1px solid var(--border)' }}>
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="text-sm font-medium text-white truncate">{task.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <CategoryBadge category={task.category} />
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                        <CoinBadge amount={task.coins} size="sm" />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                acceptedTasks.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--text-secondary)' }}>No accepted tasks yet</p>
                ) : (
                  <div className="space-y-2">
                    {acceptedTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-xl"
                        style={{ border: '1px solid var(--border)' }}>
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="text-sm font-medium text-white truncate">{task.title}</div>
                          <StatusBadge status={task.status} />
                        </div>
                        <CoinBadge amount={task.coins} size="sm" />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}