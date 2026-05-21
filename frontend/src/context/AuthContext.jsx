import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Demo user for offline/demo mode
const DEMO_USER = {
  username: 'demo',
  name: 'Demo User',
  email: 'demo@orderstream.app',
  roles: ['ROLE_ADMIN'],
  subscription: 'PREMIUM',
  organizationId: 'demo-org',
  onboardingComplete: true,
  isDemo: true,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState({ google: false, github: false, email: true, magicLink: false, resend: false });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);

    // Fetch available auth providers from backend
    api.get('/auth/providers')
      .then(res => setProviders(res.data))
      .catch(() => {}); // Backend might not be running yet
  }, []);

  const login = async (credentials) => {
    // Demo mode: allow demo/demo login without backend
    if (credentials.username === 'demo' && credentials.password === 'demo') {
      const demoToken = 'demo-token-' + Date.now();
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(DEMO_USER));
      setUser(DEMO_USER);
      return DEMO_USER;
    }

    const response = await api.post('/auth/login', credentials);
    const { token, username, roles } = response.data;
    localStorage.setItem('token', token);

    // Fetch full user profile after login
    try {
      const profileRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { email, name, subscription, organizationId, onboardingComplete } = profileRes.data;
      const userData = { username, roles, email, name, subscription, organizationId, onboardingComplete };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch {
      const userData = { username, roles };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
  };

  const register = async (userData) => {
    return await api.post('/auth/register', userData);
  };

  const loginSocial = async (token) => {
    localStorage.setItem('token', token);

    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { username, roles, email, name, subscription, organizationId, onboardingComplete } = response.data;
      const userData = { username, roles, email, name, subscription, organizationId, onboardingComplete };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Failed to sync user profile", err);
      const userData = { username: 'User', roles: ['ROLE_CUSTOMER'] };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
  };

  const verifyOtp = async (email, code) => {
    await api.post(`/auth/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
  };

  const resendOtp = async (email) => {
    await api.post(`/auth/resend-code?email=${encodeURIComponent(email)}`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await api.get('/auth/me');
      const { username, roles, email, name, subscription, organizationId, onboardingComplete } = response.data;
      const userData = { username, roles, email, name, subscription, organizationId, onboardingComplete };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  const hasRole = (role) => user?.roles?.includes(role);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      loginSocial,
      loginWithSocialToken: loginSocial,
      verifyOtp,
      resendOtp,
      logout,
      refreshUser,
      hasRole,
      providers,
      isAdmin: hasRole('ROLE_ADMIN'),
      isManager: hasRole('ROLE_MANAGER'),
      isLoading: loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
