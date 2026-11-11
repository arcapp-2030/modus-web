'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  ChevronRight,
  Compass,
  Home,
  LogOut,
  Map,
  Settings,
  User,
  X,
} from 'lucide-react';
import { authStorage } from '@/lib/auth-storage'; // Gerenciador de token/sessão web

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  activeRoute?: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeRoute = 'index',
}: SidebarProps) {
  const router = useRouter();
  const [userName, setUserName] = useState('Usuário');

  // Busca o nome do usuário armazenado ou via API se necessário
  useEffect(() => {
    // Exemplo simulado ou buscando do localStorage/estado global
    const storedUser = localStorage.getItem('modus_user_name');
    if (storedUser) {
      setUserName(storedUser);
    }
  }, []);

  // Gera as iniciais automaticamente com base no nome (ex: "Arquimedes Luciano" -> "AL")
  const getInitials = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return 'US';
    const names = cleanName.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userName);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      authStorage.clearToken();
      localStorage.removeItem('modus_user_name');
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    } finally {
      onClose();
      router.push('/login');
    }
  };

  const menuItems = [
    { id: 'index', label: 'Início', icon: Home, path: '/dashboard' },
    { id: 'orbis', label: 'Minha Jornada', icon: Map, path: '/dashboard/orbis' },
    {
      id: 'busca',
      label: 'Explorar Destinos',
      icon: Compass,
      path: '/dashboard/busca',
    },
    {
      id: 'assistente',
      label: 'Assistente de Viagem',
      icon: Bot,
      path: '/dashboard/assistente',
    },
    { id: 'profile', label: 'Meu Perfil', icon: User, path: '/dashboard/profile' },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      path: '/dashboard/settings',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop Escuro */}
      <div
        className="fixed inset-0 bg-[#030712]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Painel da Sidebar */}
      <div className="relative w-80 max-w-[85vw] h-full bg-[#070c18] border-r border-sky-500/40 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <span className="text-xs font-extrabold text-sky-400 tracking-[1.5px] uppercase">
            MODUS
          </span>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Perfil Dinâmico */}
        <div className="p-4 border-b border-slate-800/60">
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 bg-slate-900/80 rounded-xl p-3 border border-sky-500/20 hover:border-sky-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-extrabold text-white">
                {userInitials}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-sky-400 transition-colors">
                {userName}
              </h4>
              <p className="text-[10px] font-medium text-slate-400">
                Membro Explorer
              </p>
            </div>

            <ChevronRight size={16} className="text-slate-500 shrink-0" />
          </Link>
        </div>

        {/* Menus de Navegação */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/12 border border-sky-500/30 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-sky-400' : 'text-slate-400'}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Botão de Encerrar Sessão */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/80 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all text-xs font-semibold"
          >
            <LogOut size={18} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
}