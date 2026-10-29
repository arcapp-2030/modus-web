import axios from 'axios';
import { authStorage } from '@/lib/auth-storage';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://sua-api.com',
});

// Interceptor para injetar o Token JWT em cada requisição
api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar token expirado (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      authStorage.clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);