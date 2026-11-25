import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-super-seguro';
const COOKIE_NAME = 'modus_auth_token';

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
    const staffId = decoded.userId || decoded.id;
    if (!staffId) return null;

    const user = await prisma.user.findUnique({
      where: { id: staffId },
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

async function canAccessClient(
  staff: { id: string; role: string },
  clientId: string
) {
  if (staff.role === 'ADMIN') return true;

  const link = await prisma.clientManager.findUnique({
    where: {
      managerId_clientId: {
        managerId: staff.id,
        clientId,
      },
    },
    select: { clientId: true },
  });

  return Boolean(link);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getAuthenticatedStaff(request);
    if (!staff) {
      return NextResponse.json(
        { error: 'Acesso restrito a agentes (MANAGER) ou proprietário (ADMIN).' },
        { status: 403 }
      );
    }

    const { id: clientId } = await context.params;
    const allowed = await canAccessClient(staff, clientId);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Cliente não vinculado à sua carteira.' },
        { status: 403 }
      );
    }

    const documents = await prisma.clientDocument.findMany({
      where: { userId: clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error('Erro em GET /api/admin/clients/[id]/documents:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar documentos do cliente.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getAuthenticatedStaff(request);
    if (!staff) {
      return NextResponse.json(
        { error: 'Acesso restrito a agentes (MANAGER) ou proprietário (ADMIN).' },
        { status: 403 }
      );
    }

    const { id: clientId } = await context.params;
    const allowed = await canAccessClient(staff, clientId);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Cliente não vinculado à sua carteira.' },
        { status: 403 }
      );
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, role: true },
    });

    if (!client || client.role !== 'USER') {
      return NextResponse.json(
        { error: 'Cliente não encontrado.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl.trim() : '';
    const category =
      typeof body.category === 'string' && body.category.trim()
        ? body.category.trim().toUpperCase()
        : 'OTHER';
    const fileName =
      typeof body.fileName === 'string' && body.fileName.trim()
        ? body.fileName.trim()
        : null;
    const mimeType =
      typeof body.mimeType === 'string' && body.mimeType.trim()
        ? body.mimeType.trim()
        : null;
    const fileSize =
      typeof body.fileSize === 'number' && Number.isFinite(body.fileSize)
        ? Math.round(body.fileSize)
        : null;
    const notes =
      typeof body.notes === 'string' && body.notes.trim()
        ? body.notes.trim()
        : null;

    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: 'Título e URL do arquivo são obrigatórios.' },
        { status: 400 }
      );
    }

    const createdDoc = await prisma.$transaction(async (tx) => {
      const doc = await tx.clientDocument.create({
        data: {
          title,
          category,
          fileUrl,
          fileName,
          mimeType,
          fileSize,
          notes,
          userId: clientId,
          uploadedById: staff.id,
        },
        include: {
          uploadedBy: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: staff.id,
          action: 'ATTACHED_CLIENT_DOCUMENT',
          details: {
            documentId: doc.id,
            clientId,
            title,
            category,
            fileUrl,
          },
        },
      });

      return doc;
    });

    return NextResponse.json(createdDoc, { status: 201 });
  } catch (error) {
    console.error('Erro em POST /api/admin/clients/[id]/documents:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar documento do cliente.' },
      { status: 500 }
    );
  }
}