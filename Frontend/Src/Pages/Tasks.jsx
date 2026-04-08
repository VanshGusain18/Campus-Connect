import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../utils/api';
import { TaskCard, TaskCardSkeleton, EmptyState } from '../components/UI';
import toast from 'react-hot-toast';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Tutoring', 'Printing', 'Delivery', 'Notes', 'Tech Help', 'General'];

export default function Tasks() {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskApi.getAll({});
      setTasks(res.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await taskApi.accept(id);
      toast.success('Task accepted! 💪');
      await Promise.all([fetchTasks(), refreshUser()]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = tasks
    .filter(t => {
      const q = search.toLowerCase();
      return (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    })
    .filter(t => category === 'All' || t.category === category)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'highest') return b.coins - a.coins;
      if (sortBy === 'lowest') return a.coins - b.coins;
      return 0;
    });

  return (
    <div className="flex-1 p-6 lg:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Clash Display, sans-serif' }}>Browse Tasks</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Find tasks to help with and earn coins</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${category === cat ? '' : 'hover:bg-white/5'}`}
                style={category === cat
                  ? { background: 'rgba(108,99,255,0.2)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                }>
                {cat}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <SlidersHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="input-dark px-3 py-1.5 rounded-xl text-xs cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="highest">Highest Reward</option>
              <option value="lowest">Lowest Reward</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length} task{filtered.length !== 1 ? 's' : ''} found
          {category !== 'All' && ` in ${category}`}
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No tasks found"
          subtitle={search || category !== 'All' ? 'Try adjusting your filters' : 'No open tasks at the moment'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={user?.id}
              onAccept={handleAccept}
              onComplete={() => {}}
              onCancel={() => {}}
              loading={actionLoading === task.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}