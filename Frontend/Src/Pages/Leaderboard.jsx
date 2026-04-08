import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { statsApi } from '../utils/api';
import { Avatar, CoinBadge } from '../components/UI';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.leaderboard().then(r => setLeaders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const RANK_STYLES = [
    { bg: 'rgba(247,183,49,0.15)', border: 'rgba(247,183,49,0.3)', color: '#F7B731', icon: '🥇' },
    { bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.2)', color: '#C0C0C0', icon: '🥈' },
    { bg: 'rgba(205,127,50,0.1)', border: 'rgba(205,127,50,0.2)', color: '#CD7F32', icon: '🥉' },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(247,183,49,0.15)', border: '1px solid rgba(247,183,49,0.3)' }}>
            <Trophy size={28} style={{ color: '#F7B731' }} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display, sans-serif' }}>Leaderboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Top earners on campus this month</p>
        </div>

        {/* Top 3 podium */}
        {!loading && leaders.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
              const pos = i === 0 ? 1 : i === 1 ? 0 : 2;
              const heights = ['h-28', 'h-36', 'h-24'];
              const style = RANK_STYLES[pos];
              return (
                <div key={l.id} className={`flex-1 max-w-[120px] ${heights[i]} rounded-2xl flex flex-col items-center justify-center p-3 ${l.is_me ? 'glow-brand' : ''}`}
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                  <span className="text-2xl mb-2">{style.icon}</span>
                  <Avatar name={l.name} color={l.avatar_color} size="sm" />
                  <div className="text-xs font-semibold text-white mt-1 text-center leading-tight truncate w-full text-center">
                    {l.name.split(' ')[0]}
                  </div>
                  <div className="text-xs font-mono font-bold mt-0.5" style={{ color: style.color }}>{l.coin_balance}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div className="glass rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {leaders.map((l, i) => (
                <div key={l.id}
                  className={`flex items-center gap-4 px-5 py-4 transition-all ${l.is_me ? 'glow-brand' : ''}`}
                  style={l.is_me ? { background: 'rgba(108,99,255,0.08)' } : {}}>
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {i < 3 ? (
                      <span className="text-xl">{RANK_STYLES[i].icon}</span>
                    ) : (
                      <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>#{i + 1}</span>
                    )}
                  </div>

                  <Avatar name={l.name} color={l.avatar_color} size="sm" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{l.name}</span>
                      {l.is_me && (
                        <span className="badge text-xs" style={{ background: 'rgba(108,99,255,0.15)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }}>You</span>
                      )}
                    </div>
                  </div>

                  <CoinBadge amount={l.coin_balance} />
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
          Help more people to climb the leaderboard 🚀
        </p>
      </div>
    </div>
  );
}