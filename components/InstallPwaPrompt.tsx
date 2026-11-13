'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Registra o Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Falha ao registrar Service Worker:', err);
      });
    }

    // 2. Intercepta o evento nativo de instalação do Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Impede o mini-infobar padrão discreto do Chrome
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true); // Exibe nosso banner customizado
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Esconde o banner caso o app já tenha sido instalado
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Dispara o modal nativo do Android
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-slate-900/95 backdrop-blur-md border border-sky-500/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
          <Download size={20} className="text-sky-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Instalar Modus Travel</h4>
          <p className="text-[11px] text-slate-400">
            Acesse seus roteiros e vouchers direto da tela inicial.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={() => setIsVisible(false)}
          aria-label="Fechar"
          className="text-slate-400 hover:text-white p-1.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}