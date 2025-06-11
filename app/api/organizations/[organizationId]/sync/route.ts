import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncCitizens } from '@/lib/actions/sync';
import { logger } from '@/lib/logger';
import type { SyncConfig } from '@/types/api';

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
        metadata: true,
      },
    });

    if (!organization?.apiUrl) {
      return new NextResponse('API URL not configured', { status: 400 });
    }

    const metadata = organization.metadata ? JSON.parse(organization.metadata) : {};
    const syncSystem = metadata.syncSystem ?? 'esx';

    if (!['esx', 'qbcore'].includes(syncSystem)) {
      return new NextResponse('Invalid sync system configured', { status: 400 });
    }

    // Préparer la configuration de synchronisation
    const syncConfig: SyncConfig = {
      system: syncSystem,
      organizationId,
      syncInterval: organization.syncInterval ?? 300000,
      [syncSystem]: {
        baseUrl: organization.apiUrl,
      },
    };

    // Exécuter la synchronisation
    const result = await syncCitizens(syncConfig);

    if (result.status === 'error') {
      return new NextResponse(result.error ?? 'Sync failed', { status: 500 });
    }

    // Mettre à jour la date de dernière synchronisation
    await prisma.organization.update({
      where: { id: organizationId },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({ 
      success: true,
      stats: result.stats,
      lastSyncAt: result.lastSyncAt,
    });
  } catch (error) {
    logger.error('Sync error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error', 
      { status: 500 }
    );
  }
} 