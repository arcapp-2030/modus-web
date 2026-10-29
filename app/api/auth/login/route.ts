import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Buscar usuário no Neon
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }

    // 2. Validar senha (exemplo com bcrypt)
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }

    // 3. Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
      },
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: 'exemplo_jwt_token_aqui',
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ message: 'Erro interno no servidor' }, { status: 500 });
  }
}