import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token to memory Axios helper
  const updateToken = (newToken) => {
    setToken(newToken);
    setAccessToken(newToken);
  };

  // Profile retrieval using api instance
  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/api/auth/profile');
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch user profile:', err.message);
      logoutLocal();
    }
  };

  // Perform initial session check (silent refresh) on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try refreshing token using httpOnly cookie
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        if (res.data && res.data.token) {
          updateToken(res.data.token);
          
          // Retrieve profile with the new token
          const profileRes = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${res.data.token}` },
          });
          setUser(profileRes.data);
        }
      } catch (err) {
        console.log('No active session / cookie found.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up event listeners for events emitted by Axios interceptors
  useEffect(() => {
    const handleRefresh = (e) => {
      updateToken(e.detail);
    };

    const handleForceLogout = () => {
      logoutLocal();
    };

    window.addEventListener('auth-token-refresh', handleRefresh);
    window.addEventListener('auth-logout', handleForceLogout);

    return () => {
      window.removeEventListener('auth-token-refresh', handleRefresh);
      window.removeEventListener('auth-logout', handleForceLogout);
    };
  }, []);

  const logoutLocal = () => {
    setToken(null);
    setAccessToken(null);
    setUser(null);
  };

  // Register action
  const register = async (name, email, password, role) => {
    const res = await axios.post('/api/auth/register', { name, email, password, role });
    const { token: accessToken } = res.data;
    updateToken(accessToken);
    
    // Fetch and bind complete profile
    const profile = await axios.get('/api/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setUser(profile.data);
    return profile.data;
  };

  // Login action
  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: accessToken } = res.data;
    updateToken(accessToken);
    
    // Fetch and bind complete profile
    const profile = await axios.get('/api/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setUser(profile.data);
    return profile.data;
  };

  // Logout action
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('API logout request failed:', err.message);
    } finally {
      logoutLocal();
    }
  };

  // Update profile handler
  const updateProfile = async (formData) => {
    // Requires multipart/form-data for resume files
    const res = await api.put('/api/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
