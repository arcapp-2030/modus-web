'use client';

import { useEffect, useState } from 'react';
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
import { authStorage } from '@/lib/auth-storage';
import { ThemeToggle } from './ThemeToggle';

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
  const [userName, setUserName] = useState('Usuário');
  const [userRole, setUserRole] = useState<string>('USER');

  useEffect(() => {
    const storedUser = localStorage.getItem('modus_user_name');
    if (storedUser) {
      setUserName(storedUser);
    }

    const storedRole = localStorage.getItem('modus_user_role');
    if (storedRole) {
      setUserRole(storedRole);
    }

    // Sincroniza nome e role do banco caso a rota de perfil já esteja ativa
    fetch('/api/user/profile', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.name) {
          setUserName(data.name);
          localStorage.setItem('modus_user_name', data.name);
        }
        if (data.role) {
          setUserRole(data.role);
          localStorage.setItem('modus_user_role', data.role);
        }
      })
      .catch(() => {
        // Mantém os valores locais se a rota ainda não estiver disponível
      });
  }, [isOpen]);

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
      await fetch('/api/logout', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    } finally {
      authStorage.clearToken();
      localStorage.removeItem('modus_user_name');
      localStorage.removeItem('modus_user_role');
      onClose();
      window.location.replace('/login');
    }
  };

  const menuItems = [
    { id: 'index', label: 'Início', icon: Home, path: '/dashboard' },
    ...(userRole === 'MANAGER'
      ? [{ id: 'admin', label: 'Painel do Agente', icon: Compass, path: '/dashboard/admin' }]
      : []),
    { id: 'orbis', label: 'Minha Jornada', icon: Map, path: '/dashboard/orbis' },
    { id: 'busca', label: 'Explorar Destinos', icon: Compass, path: '/dashboard/busca' },
    { id: 'assistente', label: 'Assistente de Viagem', icon: Bot, path: '/dashboard/assistente' },
    { id: 'profile', label: 'Meu Perfil', icon: User, path: '/dashboard/profile' },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/dashboard/settings' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 dark:bg-[#030712]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Painel da Sidebar */}
      <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#070c18] text-slate-900 dark:text-white border-r border-slate-200 dark:border-sky-500/40 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 transition-colors">
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 tracking-[1.5px] uppercase">
            MODUS
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Perfil Dinâmico */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/60">
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-sky-500/20 hover:border-sky-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-extrabold text-white">
                {userInitials}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {userName}
              </h4>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {userRole === 'MANAGER' ? 'Agente / Manager' : 'Membro Explorer'}
              </p>
            </div>

            <ChevronRight size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
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
                    ? 'bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-white font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Seletor de Tema Claro/Escuro */}
        <div className="px-4 pt-3 pb-2 border-t border-slate-200 dark:border-slate-800">
          <ThemeToggle />
        </div>

        {/* Botão de Encerrar Sessão */}
        <div className="px-4 pb-4 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all text-xs font-semibold"
          >
            <LogOut size={18} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
}