import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowRight, Star, Users, CheckCircle, Coins, Shield, Sparkles } from 'lucide-react';

const CATEGORIES = ['Tutoring', 'Printing', 'Delivery', 'Notes', 'Tech Help', 'Design', 'Errands'];
const FEATURES = [
  { icon: '⚡', title: 'Post in Seconds', desc: 'Create service requests instantly with your coin reward.' },
  { icon: '🤝', title: 'Peer-to-Peer', desc: 'Every student can be both requester and provider.' },
  { icon: '🪙', title: 'Virtual Coins', desc: 'Earn coins by helping others, spend them for help.' },
  { icon: '🔒', title: 'Campus Only', desc: 'A trusted network within your college community.' },
];

const TESTIMONIALS = [
  { name: 'Riya Kapoor', dept: 'CS, 3rd Year', text: 'Got my assignment printed within 15 minutes. Amazing!', coins: 45, avatar: '#6C63FF' },
  { name: 'Ankit Joshi', dept: 'Mech, 2nd Year', text: 'Earned 200 coins this month just by tutoring juniors.', coins: 200, avatar: '#43D9AD' },
  { name: 'Priya Singh', dept: 'EE, 4th Year', text: 'Never been late to a submission again. Love this platform.', coins: 80, avatar: '#FF6584' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState(0);
  const [counts, setCounts] = useState({ users: 0, tasks: 0, coins: 0 });

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  // Category ticker
  useEffect(() => {
    const t = setInterval(() => setActiveCategory(c => (c + 1) % CATEGORIES.length), 2000);
    return () => clearInterval(t);
  }, []);

  // Count up animation
  useEffect(() => {
    const targets = { users: 1240, tasks: 3580, coins: 48000 };
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        users: Math.floor(targets.users * ease),
        tasks: Math.floor(targets.tasks * ease),
        coins: Math.floor(targets.coins * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb w-96 h-96 -top-48 -left-48" style={{ background: 'rgba(108,99,255,0.15)', animationDuration: '8s' }} />
        <div className="orb w-80 h-80 top-1/3 -right-40" style={{ background: 'rgba(67,217,173,0.1)', animationDuration: '10s', animationDelay: '2s' }} />
        <div className="orb w-64 h-64 bottom-1/4 left-1/4" style={{ background: 'rgba(255,101,132,0.08)', animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #43D9AD)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Campus Connect
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5 cursor-pointer"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 animate-fade-in"
          style={{ background: 'rgba(108,99,255,0.1)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.2)' }}>
          <Sparkles size={12} />
          The Student Economy is Here
          <Sparkles size={12} />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up"
          style={{ fontFamily: 'Clash Display, sans-serif' }}>
          Help Each Other.
          <br />
          <span className="gradient-text">Earn Together.</span>
        </h1>

        <p className="text-lg md:text-xl mb-4 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Campus Connect is the peer-to-peer service exchange platform for your college.
          Post tasks, help classmates, and earn virtual coins.
        </p>

        {/* Category ticker */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Popular:</span>
          <div className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{ background: 'rgba(108,99,255,0.15)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.25)' }}>
            {CATEGORIES[activeCategory]}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/register')}
            className="btn-primary px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-2 cursor-pointer">
            Start for Free <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')}
            className="px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:bg-white/5 cursor-pointer"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            Sign In →
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-20 max-w-lg mx-auto">
          {[
            { value: counts.users.toLocaleString() + '+', label: 'Students' },
            { value: counts.tasks.toLocaleString() + '+', label: 'Tasks Done' },
            { value: counts.coins.toLocaleString() + '+', label: 'Coins Earned' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white font-mono gradient-text">{s.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-3" style={{ fontFamily: 'Clash Display, sans-serif' }}>
          How it Works
        </h2>
        <p className="text-center mb-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Simple, fast, and built for campus life
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover-lift text-center"
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-white mb-2 text-base">{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-12" style={{ fontFamily: 'Clash Display, sans-serif' }}>
          What Students Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${t.avatar}, ${t.avatar}99)` }}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.dept}</div>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
              <div className="flex items-center gap-1 text-xs" style={{ color: '#6C63FF' }}>
                <Coins size={12} />
                <span className="font-mono font-bold">{t.coins} coins earned</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-10 gradient-border">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Ready to join your campus economy?
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Start with 100 free coins. No credit card required.
          </p>
          <button onClick={() => navigate('/register')}
            className="btn-primary px-10 py-4 rounded-2xl text-base font-bold cursor-pointer inline-flex items-center gap-2">
            Join Campus Connect <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <p className="text-sm">© 2024 Campus Connect · Built with ❤️ for college students</p>
      </footer>
    </div>
  );
}