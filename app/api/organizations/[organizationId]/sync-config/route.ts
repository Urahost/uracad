import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const syncConfigSchema = z.object({
  apiUrl: z.string().url(),
  syncInterval: z.number().min(60000).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { organizationId } = await context.params;

    const body = await request.json();
    const validatedData = syncConfigSchema.parse(body);

    // Vérifier que l'utilisateur a accès à l'organisation
    const member = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!member) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Mettre à jour la configuration
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        apiUrl: validatedData.apiUrl,
        syncInterval: validatedData.syncInterval,
      },
      select: {
        id: true,
        apiUrl: true,
        syncInterval: true,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error updating sync config:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 