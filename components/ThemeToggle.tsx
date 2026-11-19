'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita mismatch de hidratação garantindo renderização apenas no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-full rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all"
    >
      <span className="flex items-center gap-2.5">
        {isDark ? (
          <>
            <Sun size={16} className="text-amber-400" />
            Modo Claro
          </>
        ) : (
          <>
            <Moon size={16} className="text-sky-600" />
            Modo Escuro
          </>
        )}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {isDark ? 'Ativar' : 'Ativar'}
      </span>
    </button>
  );
}