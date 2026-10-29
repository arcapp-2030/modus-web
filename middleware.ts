import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('modus_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Defina as rotas públicas que não exigem login
  const isPublicRoute = pathname === '/login' || pathname === '/register';

  // 1. Se tentar acessar uma rota privada sem token -> Redireciona para /login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Se já estiver logado e tentar acessar /login -> Redireciona para /dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Aplica o middleware a todas as rotas, ignorando arquivos estáticos/ícones/PWA
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)'],
};