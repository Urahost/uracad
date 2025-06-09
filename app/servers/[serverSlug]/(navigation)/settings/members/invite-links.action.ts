"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/auth-user";
import { serverAction } from "@/lib/actions/safe-actions";
import { z } from "zod";
import { getServerUrl } from "@/lib/server-url";
// Schéma pour la création d'un lien d'invitation
const createLinkSchema = z.object({
  role: z.string(),
  maxUses: z.string(),
  expiresIn: z.string()
});

// Créer un nouveau lien d'invitation
export const createInviteLink = serverAction.schema(
  createLinkSchema
).action(async ({ parsedInput: data }) => {
  const session = await getSession();
  
  if (!session?.session.activeOrganizationId) {
    throw new Error("No active organization");
  }
  
  // Convertir les valeurs
  const maxUses = data.maxUses === "unlimited" ? null : parseInt(data.maxUses);
  
  // Calculer la date d'expiration
  let expiresAt: Date | null = null;
  
  if (data.expiresIn !== "never") {
    expiresAt = new Date();
    switch (data.expiresIn) {
      case "1h": expiresAt.setHours(expiresAt.getHours() + 1); break;
      case "6h": expiresAt.setHours(expiresAt.getHours() + 6); break;
      case "12h": expiresAt.setHours(expiresAt.getHours() + 12); break;
      case "1d": expiresAt.setDate(expiresAt.getDate() + 1); break;
      case "7d": expiresAt.setDate(expiresAt.getDate() + 7); break;
      case "30d": expiresAt.setDate(expiresAt.getDate() + 30); break;
    }
  }
  
  // Générer un code unique
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Créer le lien
  const link = await prisma.inviteLink.create({
    data: {
      code,
      role: data.role,
      maxUses,
      expiresAt,
      createdById: session.user.id,
      createdByName: session.user.name,
      organizationId: session.session.activeOrganizationId,
    },
    include: {
      organization: true,
    },
  });
  
  return {
    ...link,
    url: `${getServerUrl()}/servers/${link.organization.slug}/public/invite/${link.code}`,
  };
});

// Récupérer tous les liens d'invitation
export async function getInviteLinks() {
  const session = await getSession();
  
  if (!session?.session.activeOrganizationId) {
    throw new Error("No active organization");
  }
  
  const links = await prisma.inviteLink.findMany({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      organization: true,
    },
  });
  
  // Ajouter l'URL complète à chaque lien
  const baseUrl = getServerUrl();
  
  return links.map((link) => ({
    ...link,
    url: `${baseUrl}/servers/${link.organization.slug}/public/invite/${link.code}`,
  }));
}

// Schéma pour la mise à jour d'un lien
const updateLinkSchema = z.object({
  id: z.string(),
  isActive: z.boolean()
});

// Mettre à jour un lien (activation/désactivation)
export const updateInviteLink = serverAction.schema(
  updateLinkSchema
).action(async ({ parsedInput: { id, isActive } }) => {
  const session = await getSession();
  
  if (!session?.session.activeOrganizationId) {
    throw new Error("No active organization");
  }
  
  const link = await prisma.inviteLink.update({
    where: {
      id,
      organizationId: session.session.activeOrganizationId,
    },
    data: {
      isActive,
    },
    include: {
      organization: true,
    },
  });
  
  return {
    ...link,
    url: `${getServerUrl()}/servers/${link.organization.slug}/public/invite/${link.code}`,
  };
});

// Régénérer un code de lien
export const regenerateInviteLink = serverAction.schema(
  z.object({ id: z.string() })
).action(async ({ parsedInput: { id } }) => {
  const session = await getSession();

  if (!session?.session.activeOrganizationId) {
    throw new Error("No active organization");
  }
  
  const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const link = await prisma.inviteLink.update({
    where: {
      id,
      organizationId: session.session.activeOrganizationId,
    },
    data: {
      code: newCode,
      uses: 0,
    },
    include: {
      organization: true,
    },
  });
  
  return {
    ...link,
    url: `${getServerUrl()}/servers/${link.organization.slug}/public/invite/${link.code}`,
  };
});

// Supprimer un lien
export const deleteInviteLink = serverAction.schema(
  z.object({ id: z.string() })
).action(async ({ parsedInput: { id } }) => {
  const session = await getSession();
  
  if (!session?.session.activeOrganizationId) {
    throw new Error("No active organization");
  }
  
  await prisma.inviteLink.delete({
    where: {
      id,
      organizationId: session.session.activeOrganizationId,
    },
  });
  
  return { success: true };
}); 