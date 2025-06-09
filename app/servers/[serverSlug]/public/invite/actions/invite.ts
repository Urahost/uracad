"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { type InviteResponse, type InviteLink } from "../types/invite";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { getRequiredUser } from "@/lib/auth/auth-user";

// Schéma de validation pour le code d'invitation
const inviteCodeSchema = z.object({
  code: z.string().min(1, "Le code d'invitation est requis")
});

// Type pour les entrées des actions
export type InviteCodeInput = z.infer<typeof inviteCodeSchema>;

// Action de validation d'invitation (publique)
const validateInviteAction = serverAction
  .schema(inviteCodeSchema)
  .action(async ({ parsedInput: { code } }): Promise<InviteLink> => {
    const invite = await prisma.inviteLink.findFirst({
      where: {
        code,
        isActive: true,
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          {
            OR: [
              { maxUses: null },
              { uses: { lt: prisma.inviteLink.fields.maxUses } }
            ]
          }
        ]
      },
      include: {
        organization: {
          select: {
            slug: true,
            name: true,
            logo: true
          }
        }
      }
    });

    if (!invite) {
      throw new Error("Invitation invalide ou expirée");
    }

    // Vérifier le statut de l'invitation
    if (!invite.isActive) {
      throw new Error("Cette invitation a été désactivée");
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new Error("Cette invitation a expiré");
    }

    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new Error("Cette invitation a atteint sa limite d'utilisations");
    }

    // Transformer le résultat pour correspondre au type InviteLink
    return {
      ...invite,
      creator: invite.createdByName ? {
        name: invite.createdByName,
        image: null
      } : null
    };
  });

// Action d'acceptation d'invitation (nécessite une authentification)
const acceptInviteAction = serverAction
  .schema(inviteCodeSchema)
  .action(async ({ parsedInput: { code } }): Promise<InviteLink> => {
    const [invite, user] = await Promise.all([
      resolveActionResult(validateInviteAction({ code })),
      getRequiredUser()
    ]);

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = await prisma.member.findFirst({
      where: {
        organizationId: invite.organizationId,
        userId: user.id
      }
    });

    if (existingMember) {
      throw new Error("Vous êtes déjà membre de cette organisation");
    }

    // Ajouter l'utilisateur à l'organisation
    await prisma.$transaction(async (tx) => {
      // Créer le membre
      await tx.member.create({
        data: {
          id: nanoid(11),
          organizationId: invite.organizationId,
          userId: user.id,
          role: invite.role,
          createdAt: new Date()
        }
      });

      // Incrémenter le compteur d'utilisations
      await tx.inviteLink.update({
        where: { id: invite.id },
        data: {
          uses: { increment: 1 }
        }
      });
    });

    // Récupérer l'organisation pour le slug
    const organization = await prisma.organization.findUnique({
      where: { id: invite.organizationId },
      select: { slug: true }
    });

    if (!organization) {
      throw new Error("Organisation non trouvée");
    }

    revalidatePath(`/servers/${organization.slug}`);
    redirect(`/servers/${organization.slug}`);

    // Cette ligne ne sera jamais atteinte à cause du redirect
    return invite;
  });

// Exporter les fonctions wrapper pour le hook
export async function validateInvite(input: InviteCodeInput): Promise<InviteResponse> {
  try {
    const data = await resolveActionResult(validateInviteAction(input));
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la validation de l'invitation"
    };
  }
}

export async function acceptInvite(input: InviteCodeInput): Promise<InviteResponse> {
  try {
    const data = await resolveActionResult(acceptInviteAction(input));
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'acceptation de l'invitation"
    };
  }
} 