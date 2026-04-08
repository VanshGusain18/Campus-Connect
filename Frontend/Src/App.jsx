import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

function PrivateLayout() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
          style={{ background: 'linear-gradient(135deg, #6C63FF, #43D9AD)' }}>
          <span className="text-white text-xl">⚡</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb w-96 h-96 -top-48 -right-48" style={{ background: 'rgba(108,99,255,0.08)', animationDuration: '12s' }} />
        <div className="orb w-64 h-64 bottom-1/4 left-1/4" style={{ background: 'rgba(67,217,173,0.05)', animationDuration: '10s', animationDelay: '4s' }} />
      </div>
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 lg:pl-0 pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(17,17,24,0.95)',
              color: '#f0f0ff',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#43D9AD', secondary: '#111118' } },
            error: { iconTheme: { primary: '#FF6584', secondary: '#111118' } },
          }}
        />
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/create" element={<CreateTask />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}