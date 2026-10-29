'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Carrega o estado inicial armazenado ao abrir o PWA
    const storedToken = authStorage.getToken();
    const storedUser = localStorage.getItem('modus_user_data');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    authStorage.setToken(newToken);
    localStorage.setItem('modus_user_data', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    authStorage.clearToken();
    localStorage.removeItem('modus_user_data');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);