"use server";

import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { logger } from "@/lib/logger";

/**
 * Récupère les informations de l'utilisateur connecté pour pré-remplir le formulaire d'amende
 * - Nom de l'utilisateur
 * - ID du département (si l'utilisateur est associé à un département)
 */
export async function getCurrentUserInfo() {
  try {
    const user = await getRequiredUser();
    const server = await getRequiredCurrentServerCache();
    
    // Obtenir les rôles de l'utilisateur via une requête directe
    const userRoles = await prisma.customRole.findMany({
      where: { 
        organizationId: server.id,
      },
      include: {
        department: true,
        members: {
          where: {
            userId: user.id
          }
        }
      }
    });
    
    // Pas besoin de vérifier userWithRoles car nous accédons directement aux rôles
    const primaryRole = userRoles.find((customRole) => 
      customRole.department !== null
    );
    
    // Retourner les informations nécessaires
    return {
      name: user.name,
      departmentId: primaryRole?.department?.id ?? null
    };
  } catch (error) {
    logger.error("Erreur lors de la récupération des infos de l'utilisateur:", error);
    return { 
      name: "", 
      departmentId: null 
    };
  }
} 