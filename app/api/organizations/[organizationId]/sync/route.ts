import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncCitizens } from '@/lib/actions/sync';
import { logger } from '@/lib/logger';

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

    // Récupérer la configuration de l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        apiUrl: true,
        syncInterval: true,
      },
    });

    if (!organization?.apiUrl) {
      return new NextResponse('API URL not configured', { status: 400 });
    }

    // Exécuter la synchronisation
    await syncCitizens({
      apiUrl: organization.apiUrl,
      organizationId,
      syncInterval: organization.syncInterval ?? 300000,
    });

    // Mettre à jour la date de dernière synchronisation
    await prisma.organization.update({
      where: { id: organizationId },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Sync error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 