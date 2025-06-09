"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { logger } from "@/lib/logger";

// Schéma vide pour l'action
const EmptySchema = z.object({});

/**
 * Action pour récupérer les permissions de l'utilisateur connecté
 */
export const getUserPermissionsAction = serverAction
  .schema(EmptySchema)
  .action(async () => {
    try {
      // Récupérer l'utilisateur et le serveur en cours
      const user = await getRequiredUser();
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer le membre avec son rôle personnalisé
      const member = await prisma.member.findFirst({
        where: {
          userId: user.id,
          organizationId: server.id,
        },
        include: {
          customRole: true,
        },
      });

      // Si l'utilisateur n'a pas de rôle personnalisé, retourner un tableau vide
      if (!member?.customRole?.permissions) {
        return [];
      }

      try {
        // Analyser les permissions JSON
        const permissionsObject = JSON.parse(member.customRole.permissions);
        
        // Filtrer les permissions actives (true)
        const activePermissions = Object.entries(permissionsObject)
          .filter(([_, value]) => value === true)
          .map(([key]) => key);
        
        return activePermissions;
      } catch (e) {
        logger.error("Error parsing permissions:", e);
        return [];
      }
    } catch (error) {
      logger.error("Error getting user permissions:", error);
      return [];
    }
  });

/**
 * Fonction simplifiée pour utiliser l'action
 */
export async function getUserPermissions() {
  return resolveActionResult(getUserPermissionsAction({}));
}

/**
 * Vérifie si l'utilisateur a une ou plusieurs permissions spécifiques
 * @param permission Une permission ou un tableau de permissions à vérifier
 * @param mode Mode de vérification: 'AND' (toutes les permissions sont requises) ou 'OR' (au moins une permission est requise)
 * @returns Boolean indiquant si l'utilisateur a les permissions nécessaires
 */
export async function hasUserPermission(
  permission: string | string[], 
  mode: "AND" | "OR" = "OR"
): Promise<boolean> {
  try {
    // Récupérer l'utilisateur et le serveur en cours
    const user = await getRequiredUser();
    const server = await getRequiredCurrentServerCache();
    
    // Vérifier si l'utilisateur est owner ou admin
    const member = await prisma.member.findFirst({
      where: {
        userId: user.id,
        organizationId: server.id,
      },
      select: {
        role: true,
        customRole: {
          select: {
            permissions: true
          }
        }
      },
    });

    // Les rôles owner et admin ont toujours toutes les permissions
    if (member?.role === "owner" || member?.role === "admin") {
      return true;
    }
    
    // Si l'utilisateur n'a pas de rôle personnalisé, retourner false
    if (!member?.customRole?.permissions) {
      return false;
    }

    try {
      // Analyser les permissions JSON
      const permissionsObject = JSON.parse(member.customRole.permissions);
      
      // Convertir l'objet de permissions en tableau
      const userPermissions = Object.entries(permissionsObject)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

      // Vérifier si ADMINISTRATOR est présent (donne toutes les permissions)
      if (userPermissions.includes("ADMINISTRATOR")) {
        return true;
      }
      
      // Cas d'une seule permission
      if (typeof permission === "string") {
        return userPermissions.includes(permission);
      }
      
      // Cas d'un tableau de permissions
      if (mode === "AND") {
        // Toutes les permissions sont requises
        return permission.every(p => userPermissions.includes(p));
      } else {
        // Au moins une permission est requise
        return permission.some(p => userPermissions.includes(p));
      }
    } catch (e) {
      logger.error("Error parsing permissions:", e);
      return false;
    }
  } catch (error) {
    logger.error("Error checking permissions:", error);
    return false;
  }
}

/**
 * Vérifie si une permission spécifique existe dans une liste de permissions donnée
 * Cette fonction est synchrone et n'effectue pas d'appels serveur
 * @param permission La permission à vérifier
 * @param permissions La liste des permissions de l'utilisateur
 * @returns Boolean indiquant si la permission existe
 */
export async function hasPermission(
  permission: string | string[],
  permissions: string[],
  mode: "AND" | "OR" = "OR"
): Promise<boolean> {
  // Vérifier si la liste contient ADMINISTRATOR (donne toutes les permissions)
  if (permissions.includes("ADMINISTRATOR")) {
    return true;
  }
  
  // Cas d'une seule permission
  if (typeof permission === "string") {
    return permissions.includes(permission);
  }
  
  // Cas d'un tableau de permissions
  if (mode === "AND") {
    // Toutes les permissions sont requises
    return permission.every(p => permissions.includes(p));
  } else {
    // Au moins une permission est requise
    return permission.some(p => permissions.includes(p));
  }
} 