import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-super-seguro';
const COOKIE_NAME = 'modus_auth_token';

interface TokenPayload {
  userId?: string;
  id?: string;
}

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded.userId || decoded.id || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        inviteCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'O nome é obrigatório' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: 'Perfil atualizado com sucesso!', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}