import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getFriendlyErrorMessage } from '../services/errors';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('agridiag_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('agridiag_token');
    if (!savedToken) {
      setUser(null);
      setAuthError('');
      setLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
    setLoading(true);
    setAuthError('');
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('agridiag_token');
        delete api.defaults.headers.common.Authorization;
        setToken(null);
        setUser(null);
      } else {
        setAuthError(getFriendlyErrorMessage(error, 'session'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser, token]);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token: accessToken, user: userData } = response.data;
    localStorage.setItem('agridiag_token', accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    setToken(accessToken);
    setUser(userData);
    setAuthError('');
    return userData;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { access_token: accessToken, user: userData } = response.data;
    localStorage.setItem('agridiag_token', accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    setToken(accessToken);
    setUser(userData);
    setAuthError('');
    return userData;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('agridiag_token');
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
    setAuthError('');
  }, []);

  const value = {
    user,
    token,
    loading,
    authError,
    refreshUser,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
