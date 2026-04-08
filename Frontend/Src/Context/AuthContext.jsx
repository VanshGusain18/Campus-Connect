import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cc_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      authApi.getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('cc_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('cc_token');
          localStorage.removeItem('cc_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('cc_token', res.data.token);
    localStorage.setItem('cc_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    localStorage.setItem('cc_token', res.data.token);
    localStorage.setItem('cc_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await authApi.getMe();
    setUser(res.data);
    localStorage.setItem('cc_user', JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);