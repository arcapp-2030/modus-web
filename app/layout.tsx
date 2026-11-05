import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Se você tiver o AuthProvider criado em outro lugar, ajuste o caminho relativo:
import { AuthProvider } from "@/contexts/AuthContext"; 
import { InstallPWA } from "@/components/InstallPWA";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modus - Viagens",
  description: "Aplicativo de gerenciamento de viagens PWA",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="bg-gray-100 antialiased">
        <AuthProvider>
          {/* Container para simular a largura de app no desktop */}
          <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col">
            {children}
            {/* Banner de instrução para PWA */}
            <InstallPWA />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}