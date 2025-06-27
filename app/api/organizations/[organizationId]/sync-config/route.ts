import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const syncConfigSchema = z.object({
  system: z.enum(['esx', 'qbcore'] as const),
  syncInterval: z.number().min(60000),
  apiUrl: z.string().url(),
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
      logger.warn('Unauthorized sync config update attempt');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationId } = await context.params;
    logger.info('Updating sync config for organization:', { organizationId });

    const body = await request.json();
    logger.debug('Received sync config data:', body);

    try {
      const validatedData = syncConfigSchema.parse(body);
      logger.debug('Validated sync config data:', validatedData);

      // Vérifier que l'utilisateur a accès à l'organisation
      const member = await prisma.member.findFirst({
        where: {
          organizationId,
          userId: session.user.id,
          role: { in: ['owner', 'admin'] },
        },
      });

      if (!member) {
        logger.warn('Forbidden sync config update attempt:', { 
          organizationId, 
          userId: session.user.id 
        });
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        );
      }

      // Mettre à jour la configuration
      const organization = await prisma.organization.update({
        where: { id: organizationId },
        data: {
          apiUrl: validatedData.apiUrl,
          syncInterval: validatedData.syncInterval,
          metadata: JSON.stringify({
            syncSystem: validatedData.system,
          }),
        },
        select: {
          id: true,
          apiUrl: true,
          syncInterval: true,
          lastSyncAt: true,
          metadata: true,
        },
      });

      logger.info('Sync config updated successfully:', { organizationId });
      return NextResponse.json({
        ...organization,
        syncSystem: JSON.parse(organization.metadata ?? '{}').syncSystem,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Invalid sync config data:', { 
          errors: error.errors,
          data: body 
        });
        return NextResponse.json(
          { 
            message: 'Invalid request data',
            errors: error.errors 
          },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error updating sync config:', error);
    return NextResponse.json(
      { 
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 