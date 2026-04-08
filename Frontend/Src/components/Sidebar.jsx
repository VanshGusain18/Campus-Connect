import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, CoinBadge } from './UI';
import {
  LayoutDashboard, PlusCircle, User, LogOut, Coins,
  Zap, Menu, X, Trophy
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/tasks', icon: <Zap size={18} />, label: 'Browse Tasks' },
  { to: '/create', icon: <PlusCircle size={18} />, label: 'Post Task' },
  { to: '/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
  { to: '/profile', icon: <User size={18} />, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #43D9AD)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-none" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              Campus
            </div>
            <div className="text-xs gradient-text font-bold">Connect</div>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)' }}>
          <div className="flex items-center gap-3">
            <Avatar name={user.name} color={user.avatar_color} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.name}</div>
              <CoinBadge amount={user.coin_balance} size="sm" />
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive ? 'active' : ''}`
            }
            style={({ isActive }) => ({
              color: isActive ? '#6C63FF' : 'var(--text-secondary)'
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer"
          style={{ color: '#FF6584' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r flex-shrink-0"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'rgba(17,17,24,0.95)', backdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #43D9AD)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>Campus Connect</span>
        </div>
        <div className="flex items-center gap-3">
          {user && <CoinBadge amount={user.coin_balance} size="sm" />}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div className="absolute left-0 top-0 bottom-0 w-72 border-r"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}