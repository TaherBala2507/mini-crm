import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse, AuthTokens } from '../types';
import { authApi } from '../api/auth';

type AuthUser = AuthResponse['user'];

interface AuthContextType {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    organizationName: string;
    organizationDomain: string;
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Clean up old token storage format
        const oldAuthTokens = localStorage.getItem('authTokens');
        if (oldAuthTokens) {
          localStorage.removeItem('authTokens');
        }
        
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          const parsedTokens: AuthTokens = { accessToken, refreshToken };
          setTokens(parsedTokens);

          // Fetch current user
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Invalid tokens, clear them
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setTokens(null);
          }
        }
      } catch (error) {
        console.error('Failed to load auth:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setTokens(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    if (tokens) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, [tokens]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data.user);
      setTokens(response.data.tokens);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (data: {
    organizationName: string;
    organizationDomain: string;
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await authApi.register(data);
    if (response.success && response.data) {
      setUser(response.data.user);
      setTokens(response.data.tokens);
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await authApi.logout(tokens.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};