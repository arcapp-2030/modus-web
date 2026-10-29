import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext';
import { InstallPWA } from '@/components/InstallPWA';

export const metadata: Metadata = {
  title: 'Modus',
  description: 'Seu aplicativo de gestao e produtividade em viagens',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Modus',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-100 antialiased">
        {/* Container opcional para simular a largura de app no desktop */}
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col">
          {children}
          {/* Banner de instrução para iOS */}
          <InstallPWA />
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}