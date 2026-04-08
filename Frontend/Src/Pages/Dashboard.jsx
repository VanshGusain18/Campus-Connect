import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskApi, statsApi } from '../utils/api';
import { TaskCard, TaskCardSkeleton, StatCard, EmptyState, CoinBadge } from '../components/UI';
import toast from 'react-hot-toast';
import { PlusCircle, Zap, TrendingUp, CheckSquare, Briefcase, Clock, ArrowRight } from 'lucide-react';

const TABS = [
  { key: 'available', label: 'Available', icon: <Zap size={14} /> },
  { key: 'my-posted', label: 'My Posts', icon: <Briefcase size={14} /> },
  { key: 'my-accepted', label: 'Accepted', icon: <CheckSquare size={14} /> },
];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      let params = {};
      if (tab === 'my-posted') params = { mine: 'created' };
      else if (tab === 'my-accepted') params = { mine: 'accepted' };
      const [tasksRes, statsRes] = await Promise.all([
        taskApi.getAll(params),
        statsApi.get(),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    statsApi.transactions().then(r => setTransactions(r.data)).catch(() => {});
  }, []);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await taskApi.accept(id);
      toast.success('Task accepted! Get to work 💪');
      await Promise.all([fetchTasks(), refreshUser()]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id) => {
    setActionLoading(id);
    try {
      await taskApi.complete(id);
      toast.success('Task completed! Coins transferred 🎉');
      await Promise.all([fetchTasks(), refreshUser()]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      await taskApi.cancel(id);
      toast.success('Task cancelled');
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = stats ? [
    { icon: '🪙', label: 'Coin Balance', value: stats.coin_balance, color: '#6C63FF' },
    { icon: '📋', label: 'Tasks Posted', value: stats.tasks_created, color: '#45AAF2' },
    { icon: '✅', label: 'Completed as Provider', value: stats.completed_as_provider, color: '#43D9AD' },
    { icon: '🎯', label: 'Open Tasks Available', value: stats.open_tasks_available, color: '#F7B731' },
  ] : [];

  return (
    <div className="flex-1 p-6 lg:p-8 min-h-screen overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Here's what's happening on campus
          </p>
        </div>
        <button onClick={() => navigate('/create')}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer hidden sm:flex">
          <PlusCircle size={16} /> Post Task
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats ? statCards.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 100} />
        )) : Array(4).fill(0).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Tasks Panel */}
        <div className="xl:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === t.key ? 'text-white' : ''}`}
                style={tab === t.key ? { background: 'rgba(108,99,255,0.2)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' } : { color: 'var(--text-secondary)' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Task List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => <TaskCardSkeleton key={i} />)}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={tab === 'available' ? '🔍' : tab === 'my-posted' ? '📋' : '⚡'}
              title={tab === 'available' ? 'No tasks available' : tab === 'my-posted' ? 'No tasks posted yet' : 'No accepted tasks'}
              subtitle={tab === 'available' ? 'Be the first to post a task!' : tab === 'my-posted' ? 'Create your first service request' : 'Browse available tasks to accept'}
              action={
                tab !== 'my-accepted' && (
                  <button onClick={() => navigate(tab === 'available' ? '/tasks' : '/create')}
                    className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer inline-flex items-center gap-2">
                    {tab === 'available' ? 'Browse All Tasks' : 'Post a Task'} <ArrowRight size={14} />
                  </button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tasks.slice(0, 8).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUserId={user?.id}
                  onAccept={handleAccept}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                  loading={actionLoading === task.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-5">
          {/* Coin Balance Card */}
          <div className="glass rounded-2xl p-5 gradient-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-white">Coin Wallet</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Live</span>
            </div>
            <div className="text-4xl font-bold text-white font-mono mb-1 gradient-text">
              {user?.coin_balance || 0}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Available coins</div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Earn by helping others</span>
                <span style={{ color: '#43D9AD' }}>+coins</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span style={{ color: 'var(--text-secondary)' }}>Spend when requesting</span>
                <span style={{ color: '#FF6584' }}>-coins</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
            {transactions.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                        style={{ background: t.type === 'credit' ? 'rgba(67,217,173,0.15)' : 'rgba(255,101,132,0.15)' }}>
                        {t.type === 'credit' ? '↓' : '↑'}
                      </div>
                      <div>
                        <div className="text-xs text-white font-medium truncate max-w-[130px]">{t.description}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold"
                      style={{ color: t.type === 'credit' ? '#43D9AD' : '#FF6584' }}>
                      {t.type === 'credit' ? '+' : '-'}{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Post a Task', icon: '📋', path: '/create', color: '#6C63FF' },
                { label: 'Browse Tasks', icon: '🔍', path: '/tasks', color: '#43D9AD' },
                { label: 'Leaderboard', icon: '🏆', path: '/leaderboard', color: '#F7B731' },
              ].map((a) => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5 cursor-pointer text-left"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <span>{a.icon}</span>
                  <span>{a.label}</span>
                  <ArrowRight size={14} className="ml-auto" style={{ color: a.color }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}