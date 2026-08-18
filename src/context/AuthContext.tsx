import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { api } from '../api/client';

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for existing token
  useEffect(() => {
    const savedToken = localStorage.getItem('pharmacon_token');
    const savedUser = localStorage.getItem('pharmacon_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);

        // Validate token against server
        api.get<{ user: User }>('/auth/me')
          .then((data) => {
            setUser(data.user);
            localStorage.setItem('pharmacon_user', JSON.stringify(data.user));
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem('pharmacon_token');
            localStorage.removeItem('pharmacon_user');
            setToken(null);
            setUser(null);
          })
          .finally(() => setIsLoading(false));
      } catch {
        localStorage.removeItem('pharmacon_token');
        localStorage.removeItem('pharmacon_user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('pharmacon_token', data.token);
      localStorage.setItem('pharmacon_user', JSON.stringify(data.user));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pharmacon_token');
    localStorage.removeItem('pharmacon_user');
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'instructor';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
