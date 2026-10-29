'use client';

import { useEffect, useState } from 'react';

export function InstallPWA() {
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    // Detecta se é um dispositivo iOS (iPhone/iPad/iPod)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Verifica se já está rodando em modo standalone (PWA instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as any).standalone;

    // Exibe o banner apenas se for iOS e NÃO estiver instalado
    if (isIOS && !isStandalone) {
      setShowIOSBanner(true);
    }
  }, []);

  if (!showIOSBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-sm">Instalar o app Modus</h3>
          <p className="text-xs text-slate-300 mt-1">
            Instale o Modus na sua tela de início para ter uma experiência completa de aplicativo.
          </p>
        </div>
        <button 
          onClick={() => setShowIOSBanner(false)}
          className="text-slate-400 hover:text-white text-xs px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs bg-slate-800 p-2.5 rounded-lg border border-slate-700/50">
        <span className="text-base">1️⃣</span>
        <span>Toque no botão de <strong>Compartilhar</strong> no Safari.</span>
      </div>

      <div className="flex items-center gap-2 text-xs bg-slate-800 p-2.5 rounded-lg border border-slate-700/50">
        <span className="text-base">2️⃣</span>
        <span>Role para baixo e escolha <strong>"Adicionar à Tela de Início"</strong>.</span>
      </div>
    </div>
  );
}