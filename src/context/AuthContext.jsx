import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// Add console logs to debug
console.log('AuthContext.jsx loaded');

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const data = await authService.login(credentials);
      setUser(data.user);
      return data;
    } catch (error) {
      toast.error(error || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      toast.error(error || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const data = await authService.updateProfile(userData);
      setUser(data);
      return data;
    } catch (error) {
      toast.error(error || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const data = await authService.forgotPassword(email);
      return data;
    } catch (error) {
      toast.error(error || 'Failed to send reset instructions');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const data = await authService.resetPassword(token, newPassword);
      return data;
    } catch (error) {
      toast.error(error || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      const data = await authService.verifyOTP(email, otp);
      toast.success('OTP verified successfully');
      return data;
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifyOTP,
    isAuthenticated: !!user
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 