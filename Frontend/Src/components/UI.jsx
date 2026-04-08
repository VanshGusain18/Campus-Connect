import React from 'react';
import { Coins } from 'lucide-react';

// ── Avatar ──────────────────────────────────────────────────────────────────
export const Avatar = ({ name = '', color = '#6C63FF', size = 'md', className = '' }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, boxShadow: `0 4px 15px ${color}40` }}
    >
      {initials}
    </div>
  );
};

// ── Coin Badge ───────────────────────────────────────────────────────────────
export const CoinBadge = ({ amount, size = 'md', glow = false }) => {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold font-mono ${sizes[size]} ${glow ? 'glow-brand' : ''}`}
      style={{ background: 'rgba(108,99,255,0.15)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }}
    >
      <Coins size={size === 'lg' ? 16 : 12} />
      {amount}
    </span>
  );
};

// ── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const configs = {
    open: { label: '● Open', cls: 'status-open' },
    accepted: { label: '◐ In Progress', cls: 'status-accepted' },
    completed: { label: '✓ Completed', cls: 'status-completed' },
    cancelled: { label: '✕ Cancelled', cls: 'status-cancelled' },
  };
  const c = configs[status] || configs.open;
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
};

// ── Category Badge ────────────────────────────────────────────────────────────
export const CategoryBadge = ({ category }) => {
  const colors = {
    Tutoring: 'rgba(108,99,255,0.15):#6C63FF',
    Printing: 'rgba(69,170,242,0.15):#45AAF2',
    Delivery: 'rgba(247,183,49,0.15):#F7B731',
    Notes: 'rgba(67,217,173,0.15):#43D9AD',
    'Tech Help': 'rgba(255,101,132,0.15):#FF6584',
    General: 'rgba(255,255,255,0.08):#8b8ba0',
  };
  const [bg, color] = (colors[category] || colors.General).split(':');
  return (
    <span className="badge" style={{ background: bg, color, border: `1px solid ${color}40` }}>
      {category}
    </span>
  );
};

// ── Loading Skeleton ─────────────────────────────────────────────────────────
export const TaskCardSkeleton = () => (
  <div className="glass rounded-2xl p-5 space-y-3">
    <div className="flex justify-between items-start">
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-2/3 rounded" />
    <div className="flex gap-2 pt-2">
      <div className="skeleton h-6 w-20 rounded-full" />
      <div className="skeleton h-6 w-24 rounded-full" />
    </div>
    <div className="skeleton h-9 w-full rounded-lg mt-2" />
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
    {action}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = '#6C63FF', delay = 0 }) => (
  <div
    className="glass rounded-2xl p-5 hover-lift"
    style={{ animationDelay: `${delay}ms`, animation: 'slideUp 0.5s ease-out forwards', opacity: 0 }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-white font-mono">{value}</div>
    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
  </div>
);

// ── Task Card ─────────────────────────────────────────────────────────────────
export const TaskCard = ({ task, currentUserId, onAccept, onComplete, onCancel, loading }) => {
  const isCreator = task.created_by === currentUserId;
  const isAcceptor = task.accepted_by === currentUserId;
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="glass rounded-2xl p-5 hover-lift gradient-border group transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base leading-snug truncate group-hover:text-brand-400 transition-colors">
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Avatar name={task.creator_name} color={task.creator_avatar} size="sm" />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {task.creator_name} · {timeAgo(task.created_at)}
            </span>
          </div>
        </div>
        <CoinBadge amount={task.coins} />
      </div>

      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {task.description}
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <CategoryBadge category={task.category} />
        <StatusBadge status={task.status} />
        {isCreator && <span className="badge" style={{ background: 'rgba(108,99,255,0.1)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.2)' }}>My Task</span>}
        {isAcceptor && <span className="badge" style={{ background: 'rgba(67,217,173,0.1)', color: '#43D9AD', border: '1px solid rgba(67,217,173,0.2)' }}>Accepted</span>}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {task.status === 'open' && !isCreator && (
          <button
            onClick={() => onAccept(task.id)}
            disabled={loading}
            className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Accepting...' : '⚡ Accept Task'}
          </button>
        )}
        {task.status === 'accepted' && isCreator && (
          <button
            onClick={() => onComplete(task.id)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{ background: 'rgba(67,217,173,0.15)', color: '#43D9AD', border: '1px solid rgba(67,217,173,0.3)' }}
          >
            {loading ? 'Processing...' : '✓ Mark Complete'}
          </button>
        )}
        {task.status === 'accepted' && isAcceptor && (
          <div className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
            style={{ background: 'rgba(247,183,49,0.1)', color: '#F7B731', border: '1px solid rgba(247,183,49,0.2)' }}>
            ⏳ Awaiting Confirmation
          </div>
        )}
        {task.status === 'open' && isCreator && (
          <button
            onClick={() => onCancel(task.id)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{ background: 'rgba(255,101,132,0.1)', color: '#FF6584', border: '1px solid rgba(255,101,132,0.2)' }}
          >
            Cancel Task
          </button>
        )}
        {(task.status === 'completed' || task.status === 'cancelled') && (
          <div className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {task.status === 'completed' ? '✓ Completed' : '✕ Cancelled'}
          </div>
        )}
      </div>
    </div>
  );
};