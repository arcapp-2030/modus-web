import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Sessão encerrada com sucesso' }, { status: 200 });

  // Remove o cookie HTTP diretamente no response da API
  response.cookies.set('modus_auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}