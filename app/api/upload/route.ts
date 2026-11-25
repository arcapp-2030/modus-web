import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-super-seguro';
const COOKIE_NAME = 'modus_auth_token';

const HOSTGATOR_UPLOAD_URL = process.env.HOSTGATOR_UPLOAD_URL || '';
const HOSTGATOR_UPLOAD_SECRET = process.env.HOSTGATOR_UPLOAD_SECRET || '';

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface TokenPayload {
  userId?: string;
  id?: string;
}

async function getAuthenticatedStaff(request: Request) {
  const cookieStore = await cookies();
  let token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const userId = decoded.userId || decoded.id;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    });

    if (
      !user ||
      user.status !== 'ACTIVE' ||
      (user.role !== 'MANAGER' && user.role !== 'ADMIN')
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const staff = await getAuthenticatedStaff(request);
    if (!staff) {
      return NextResponse.json(
        { error: 'Acesso restrito a agentes (MANAGER) ou proprietário (ADMIN).' },
        { status: 403 }
      );
    }

    if (!HOSTGATOR_UPLOAD_URL || !HOSTGATOR_UPLOAD_SECRET) {
      return NextResponse.json(
        { error: 'Configuração de storage da HostGator ausente no servidor.' },
        { status: 500 }
      );
    }

    const incomingForm = await request.formData();
    const file = incomingForm.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Nenhum arquivo válido enviado no campo "file".' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Formato não suportado. Envie PDF, JPG, PNG ou WEBP.' },
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'O arquivo excede o tamanho máximo de 10 MB.' },
        { status: 413 }
      );
    }

    const forwardForm = new FormData();
    forwardForm.append('file', file, file.name);

    const hgResponse = await fetch(HOSTGATOR_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'X-Upload-Secret': HOSTGATOR_UPLOAD_SECRET,
      },
      body: forwardForm,
    });

    const hgData = await hgResponse.json().catch(() => ({}));

    if (!hgResponse.ok || !hgData.url) {
      return NextResponse.json(
        { error: hgData.error || 'Falha ao armazenar arquivo na HostGator.' },
        { status: 502 }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId: staff.id,
        action: 'UPLOADED_VOUCHER_FILE',
        details: {
          url: hgData.url,
          originalName: file.name,
          mime: file.type,
          size: file.size,
        },
      },
    });

    return NextResponse.json(
      {
        url: hgData.url,
        filename: hgData.filename,
        originalName: file.name,
        mime: file.type,
        size: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro em POST /api/upload:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar upload de arquivo.' },
      { status: 500 }
    );
  }
}