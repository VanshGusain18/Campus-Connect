import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, Eye, EyeOff, BookOpen, ArrowRight } from 'lucide-react';

const DEPTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Mathematics', 'Physics', 'MBA', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, rgba(108,99,255,0.15) 0%, rgba(67,217,173,0.05) 100%)', borderRight: '1px solid var(--border)' }}>
        <div className="orb w-64 h-64 -top-20 -left-20" style={{ background: 'rgba(108,99,255,0.2)' }} />
        <div className="orb w-48 h-48 bottom-20 right-10" style={{ background: 'rgba(67,217,173,0.15)', animationDelay: '3s' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C63FF, #43D9AD)' }}>
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>Campus Connect</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Your Campus.<br />
            <span className="gradient-text">Your Economy.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Exchange skills, earn coins, and build your campus network.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[['🎓', 'Tutoring'], ['🖨️', 'Printing'], ['🚴', 'Delivery'], ['📝', 'Notes']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2 glass rounded-xl p-3">
                <span>{icon}</span>
                <span className="text-sm font-medium text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg">🪙</div>
            <div>
              <div className="text-sm font-semibold text-white">Start with 100 Coins</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Free welcome bonus on signup</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C63FF, #43D9AD)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>Campus Connect</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display, sans-serif' }}>{title}</h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async () => {
    setLoading(true);
    try {
      await login('arjun@campus.edu', 'demo123');
      toast.success('Logged in as demo user!');
      navigate('/dashboard');
    } catch {
      toast.error('Demo login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Campus Connect account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-white mb-1.5 block">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="email" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@campus.edu"
              className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-white mb-1.5 block">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
            <input
              type={showPass ? 'text' : 'password'} required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input-dark w-full pl-10 pr-10 py-3 rounded-xl text-sm"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
          {loading ? 'Signing In...' : <><span>Sign In</span><ArrowRight size={16} /></>}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <button type="button" onClick={loginDemo} disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/5 cursor-pointer"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          🧪 Try Demo Account
        </button>

        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          No account?{' '}
          <Link to="/register" className="font-semibold" style={{ color: '#6C63FF' }}>Create one free</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', year: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! You got 100 free coins 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, icon, children }) => (
    <div>
      <label className="text-sm font-medium text-white mb-1.5 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>{icon}</span>
        {children}
      </div>
    </div>
  );

  return (
    <AuthLayout title="Join Campus Connect" subtitle="Create your free account and start earning coins">
      <form onSubmit={handleSubmit} className="space-y-4">
        <F label="Full Name" icon={<User size={16} />}>
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Arjun Sharma" className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
        </F>
        <F label="College Email" icon={<Mail size={16} />}>
          <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="you@campus.edu" className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
        </F>
        <F label="Password" icon={<Lock size={16} />}>
          <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Min. 6 characters" className="input-dark w-full pl-10 pr-10 py-3 rounded-xl text-sm" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </F>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white mb-1.5 block">Department</label>
            <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
              className="input-dark w-full px-3 py-3 rounded-xl text-sm appearance-none cursor-pointer">
              <option value="">Select</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1.5 block">Year</label>
            <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}
              className="input-dark w-full px-3 py-3 rounded-xl text-sm appearance-none cursor-pointer">
              <option value="">Select</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2">
          {loading ? 'Creating Account...' : '🚀 Create Account & Get 100 Coins'}
        </button>

        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#6C63FF' }}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}