'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Exemplo de chamada protegida que você já usa no app
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900">Olá, {user?.name || 'Usuário'}</h1>
          <p className="text-xs text-slate-500">Bem-vindo ao Modus</p>
        </div>
        <button
          onClick={logout}
          className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors cursor-pointer"
        >
          Sair
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-6 flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visão Geral</h2>
          {loading ? (
            <p className="text-sm text-slate-500 mt-2">Carregando dados...</p>
          ) : (
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-800">
                {stats?.totalItems || 'Status: Ativo'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Seu PWA está rodando perfeitamente.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}