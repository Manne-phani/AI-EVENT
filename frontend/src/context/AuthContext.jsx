import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load authentication details on mount
    const savedToken = localStorage.getItem('cnc_token');
    const savedUser = localStorage.getItem('cnc_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleResponse = async (res) => {
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      if (!res.ok) {
        throw new Error(`Server connection error (${res.status}). If using a preview link, it may have expired. Please refresh the page or request a new link.`);
      }
      throw new Error('Server returned an invalid non-JSON response.');
    }
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  };

  const login = async (mobileNumber, gmail) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, gmail }),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error('Login request error:', err);
      throw err;
    }
  };

  const verifyOtp = async (mobileNumber, code) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, code }),
      });
      const data = await handleResponse(res);

      // Save token and user details
      localStorage.setItem('cnc_token', data.token);
      localStorage.setItem('cnc_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('OTP verification error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('cnc_token');
    localStorage.removeItem('cnc_user');
    setToken(null);
    setUser(null);
  };

  // Authenticated fetch wrapper helper
  const authFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle session expiration
    if (res.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    return await handleResponse(res);
  };

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@gmail.com';
  const isAdmin = !!(user && user.gmail === adminEmail);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isAdmin,
      loading,
      login,
      verifyOtp,
      logout,
      authFetch
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
