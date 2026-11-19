import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Sessão encerrada com sucesso' }, { status: 200 });

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  };


  // Remove o cookie HTTP diretamente no response da API
  response.cookies.set('modus_auth_token', '', {
    ...cookieOptions,
    secure: process.env.NODE_ENV === 'production',
  });

  response.cookies.delete('modus_auth_token');
  
  return response;
}