'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Carrega os dados do usuário ao abrir a página
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) throw new Error('Falha ao carregar perfil');
        const data = await res.json();
        setName(data.name || '');
        setEmail(data.email || '');
      } catch (err: any) {
        setError('Não foi possível carregar os dados da conta.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao salvar alterações');

      setMessage('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white items-center justify-center">
        <p className="text-sm text-slate-400">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar simples para navegação interna */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-8">
          Modus Viagens
        </h2>
        <nav className="space-y-2 text-sm">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
            Dashboard
          </Link>
          <Link href="/dashboard/settings" className="block px-4 py-2.5 rounded-xl bg-blue-600/10 text-blue-400 font-medium">
            Configurações
          </Link>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 md:p-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Configurações da Conta</h1>
          <p className="text-xs text-slate-400 mt-1">Gerencie suas informações pessoais e credenciais.</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">E-mail da Conta</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-500 mt-1">O e-mail não pode ser alterado por motivos de segurança.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}