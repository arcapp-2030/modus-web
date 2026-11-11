'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, Users, ChevronRight, Luggage, ArrowLeft } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count?: {
    trips: number;
  };
}

export default function AdminDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/admin/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  return (
    <div className="min-h-screen bg-[#080d1a] text-white p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header com Atalho de Volta */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-extrabold text-sky-400 tracking-[2px] uppercase">
            PAINEL DO AGENTE
          </span>
          <h1 className="text-2xl font-black mt-1">Gestão de Clientes & Viagens</h1>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={16} /> Voltar ao App
        </Link>
      </div>

      {/* Card Principal: Atalho para Criar Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          href="/dashboard/admin/clients/new"
          className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-xl hover:shadow-blue-500/20 transition-all border border-blue-400/30 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <UserPlus size={24} className="text-white" />
            </div>
            <ChevronRight size={20} className="text-white/60 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Cadastrar Novo Cliente</h3>
            <p className="text-xs text-blue-100/80 mt-1">
              Adicione um novo passageiro para gerenciar seus roteiros.
            </p>
          </div>
        </Link>

        {/* Métrica Rápida: Total de Clientes */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Users size={20} className="text-sky-400" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Clientes Ativos
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {clients.length}
            </span>
          </div>
        </div>
      </div>

      {/* Listagem Atualizada de Clientes */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-4">
          Seus ClientesCadastrados
        </h2>

        {loading ? (
          <p className="text-xs text-slate-400 py-4">Carregando carteira de clientes...</p>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
            <Users size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum cliente cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/admin/clients/${client.id}`}
                className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 p-4 rounded-xl border border-slate-800/80 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                    {client.name ? client.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                      {client.name || 'Sem nome'}
                    </h4>
                    <p className="text-xs text-slate-400">{client.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                    <Luggage size={14} className="text-sky-400" />
                    {client._count?.trips || 0} viagem(ns)
                  </span>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}