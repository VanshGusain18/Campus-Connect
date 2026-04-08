import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../utils/api';
import { CoinBadge } from '../components/UI';
import toast from 'react-hot-toast';
import { ArrowLeft, Coins, Lightbulb, CheckCircle } from 'lucide-react';

const CATEGORIES = ['Tutoring', 'Printing', 'Delivery', 'Notes', 'Tech Help', 'General'];
const CATEGORY_ICONS = { Tutoring: '🎓', Printing: '🖨️', Delivery: '🚴', Notes: '📝', 'Tech Help': '💻', General: '✨' };
const TIPS = [
  'Be specific about what you need',
  'Mention your deadline or urgency',
  'Include any requirements (location, tools needed)',
  'Set a fair coin reward to attract helpers',
];

export default function CreateTask() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', category: 'General', coins: 20 });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.coins > user.coin_balance) {
      toast.error('Insufficient coin balance');
      return;
    }
    setLoading(true);
    try {
      await taskApi.create(form);
      await refreshUser();
      toast.success('Task posted successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const COIN_PRESETS = [10, 20, 30, 50, 75, 100];

  return (
    <div className="flex-1 p-6 lg:p-8 min-h-screen">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-6 transition-all hover:opacity-70 cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Clash Display, sans-serif' }}>Post a Task</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Describe what you need help with</p>
        </div>

        {/* Balance warning */}
        <div className="glass rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'rgba(108,99,255,0.15)' }}>🪙</div>
            <div>
              <div className="text-sm text-white font-semibold">Your Balance</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Coins reserved on task creation</div>
            </div>
          </div>
          <CoinBadge amount={user?.coin_balance || 0} size="lg" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-white mb-3 block">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer`}
                  style={form.category === cat
                    ? { background: 'rgba(108,99,255,0.2)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.4)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                  }>
                  <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">Task Title</label>
            <input
              type="text" required
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Need help with Calculus – Integration"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              maxLength={200}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{form.title.length}/200</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">Description</label>
            <textarea
              required rows={5}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what you need, when you need it, any specific requirements..."
              className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none"
              maxLength={1000}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{form.description.length}/1000</span>
            </div>
          </div>

          {/* Coin Reward */}
          <div>
            <label className="text-sm font-semibold text-white mb-3 block">Coin Reward</label>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-3">
              {COIN_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, coins: c })}
                  className={`px-4 py-1.5 rounded-full text-sm font-mono font-bold transition-all cursor-pointer ${form.coins === c ? '' : 'hover:bg-white/5'}`}
                  style={form.coins === c
                    ? { background: 'rgba(108,99,255,0.2)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                  }>
                  {c}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Custom amount</span>
                <CoinBadge amount={form.coins} size="md" />
              </div>
              <input
                type="range" min={5} max={Math.min(200, user?.coin_balance || 200)} step={5}
                value={form.coins} onChange={e => setForm({ ...form, coins: parseInt(e.target.value) })}
                className="w-full accent-brand-500 cursor-pointer"
                style={{ accentColor: '#6C63FF' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                <span>5</span>
                <span>Max: {Math.min(200, user?.coin_balance || 200)}</span>
              </div>
            </div>

            {form.coins > (user?.coin_balance || 0) && (
              <p className="text-xs mt-2" style={{ color: '#FF6584' }}>
                ⚠️ Reward exceeds your balance ({user?.coin_balance} coins)
              </p>
            )}
          </div>

          {/* Tips */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} style={{ color: '#F7B731' }} />
              <span className="text-xs font-semibold text-white">Tips for a great post</span>
            </div>
            <div className="space-y-1.5">
              {TIPS.map((tip) => (
                <div key={tip} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#43D9AD' }} />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || form.coins > (user?.coin_balance || 0)}
            className="btn-primary w-full py-4 rounded-xl font-bold text-base cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <><span className="animate-spin">⟳</span> Posting Task...</>
            ) : (
              <>🚀 Post Task · <CoinBadge amount={form.coins} size="sm" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}