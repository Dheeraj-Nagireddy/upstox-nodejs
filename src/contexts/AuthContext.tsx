import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UpstoxClient } from '../services/upstoxClient';

interface User {
  userId: string;
  userName: string;
  email: string;
  broker: string;
  exchanges: string[];
  products: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('upstox_access_token');
    if (token) {
      initializeUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const initializeUser = async (token: string) => {
    try {
      const upstoxClient = new UpstoxClient(token);
      const profile = await upstoxClient.getProfile();
      
      setUser({
        userId: profile.userId,
        userName: profile.userName,
        email: profile.email,
        broker: profile.broker,
        exchanges: profile.exchanges,
        products: profile.products,
      });
    } catch (error) {
      console.error('Failed to initialize user:', error);
      localStorage.removeItem('upstox_access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (accessToken: string) => {
    try {
      setLoading(true);
      localStorage.setItem('upstox_access_token', accessToken);
      await initializeUser(accessToken);
    } catch (error) {
      localStorage.removeItem('upstox_access_token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('upstox_access_token');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};