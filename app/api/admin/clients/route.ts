import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// GET: Lista todos os clientes cadastrados no sistema
export async function GET() {
  try {
    const clients = await prisma.user.findMany({
      where: { role: Role.CLIENT },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { trips: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clients, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

// POST: Cadastra um novo cliente
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um cliente cadastrado com este e-mail.' },
        { status: 400 }
      );
    }

    const defaultPassword = password || 'Modus@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newClient = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: Role.CLIENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar cliente:', error);
    return NextResponse.json(
      { error: `Erro ao criar cliente: ${error.message}` },
      { status: 500 }
    );
  }
}