'use client';

import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header / Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Modus
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
            Viagens
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            Criar Conta
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Sistema inteligente de gestão de viagens
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Organize suas jornadas com <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">perfeição</span>.
        </h1>

        <p className="text-lg text-slate-300 mb-10 max-w-xl">
          O Modus centraliza seus roteiros, despesas e itinerários em um só lugar. Disponível na web e como aplicativo nativo no seu celular.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            Começar Agora <span>→</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-8 py-3.5 rounded-xl transition-all border border-slate-700 flex items-center justify-center"
          >
            Já tenho uma conta
          </Link>
        </div>

        {/* Recursos em Destaque */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
            <div className="text-2xl mb-2">🌍</div>
            <h3 className="font-semibold text-white mb-1">Roteiros Dinâmicos</h3>
            <p className="text-xs text-slate-400">Planeje cada parada com facilidade e precisão.</p>
          </div>
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold text-white mb-1">Pronto para PWA</h3>
            <p className="text-xs text-slate-400">Instale direto na tela inicial do seu celular.</p>
          </div>
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-white mb-1">Dados Seguros</h3>
            <p className="text-xs text-slate-400">Seus dados protegidos com banco de dados isolado.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800">
        &copy; {new Date().getFullYear()} Modus Viagens. Todos os direitos reservados.
      </footer>
    </div>
  );
}