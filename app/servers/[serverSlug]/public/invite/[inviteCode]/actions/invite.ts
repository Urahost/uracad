"use server";

import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { InviteResponse } from "../../types/invite";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { nanoid } from "nanoid";

// Valider une invitation
export async function validateInvite(code: string): Promise<InviteResponse> {
  try {
    // Récupérer l'invitation
    const invite = await prisma.inviteLink.findUnique({
      where: { code },
      include: {
        organization: {
          select: {
            slug: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!invite) {
      return {
        success: false,
        error: "Invitation invalide ou expirée",
      };
    }

    // Vérifier si l'invitation est active
    if (!invite.isActive) {
      return {
        success: false,
        error: "Invitation désactivée",
      };
    }

    // Vérifier si l'invitation a expiré
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return {
        success: false,
        error: "Invitation expirée",
      };
    }

    // Vérifier si le nombre maximum d'utilisations est atteint
    if (invite.maxUses !== null && invite.uses >= invite.maxUses) {
      return {
        success: false,
        error: "Nombre maximum d'utilisations atteint",
      };
    }

    // L'invitation est valide
    return {
      success: true,
      data: invite,
    };
  } catch (error) {
    logger.error("Erreur lors de la validation de l'invitation:", error);
    return {
      success: false,
      error: "Erreur serveur lors de la validation de l'invitation",
    };
  }
}

// Accepter une invitation
export async function acceptInvite(code: string): Promise<InviteResponse> {
  try {
    const session = await getRequiredUser();

    // Valider l'invitation
    const validation = await validateInvite(code);
    if (!validation.success || !validation.data) { 
      return validation;
    }

    const invite = validation.data;

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = await prisma.member.findFirst({
      where: {
        userId: session.id,
        organizationId: invite.organizationId,
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: "Vous êtes déjà membre de cette organisation",
      };
    }

    // Créer le membre
    await prisma.member.create({
      data: {
        id: nanoid(),
        userId: session.id,
        organizationId: invite.organizationId,
        role: invite.role,
        createdAt: new Date(),
      },
    });

    // Incrémenter le compteur d'utilisations
    await prisma.inviteLink.update({
      where: { id: invite.id },
      data: { uses: { increment: 1 } },
    });

    // Revalider les chemins
    revalidatePath(`/servers/${invite.organization.slug}`);
    revalidatePath(`/servers/${invite.organization.slug}/members`);

    // Retourner l'invitation (InviteLink)
    return {
      success: true,
      data: invite,
    };
  } catch (error) {
    logger.error("Erreur lors de l'acceptation de l'invitation:", error);
    return {
      success: false,
      error: "Erreur serveur lors de l'acceptation de l'invitation",
    };
  }
} 