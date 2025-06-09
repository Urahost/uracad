"use server";

import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Type de département adapté aux champs disponibles dans la base de données
 */
export type Department = {
  id: string;
  name: string;
  // Utiliser des valeurs par défaut pour les champs manquants
  acronym: string | null;
  color: string | null;
  icon: string | null;
};

/**
 * Récupère la liste des départements disponibles dans l'organisation courante
 * pour le formulaire d'amendes
 */
export async function getDepartments(): Promise<Department[]> {
  try {
    const server = await getRequiredCurrentServerCache();
    
    // Récupérer tous les départements de l'organisation
    const departments = await prisma.department.findMany({
      where: {
        organizationId: server.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Adapter les résultats au format attendu
    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      // Ajouter des valeurs par défaut pour les champs manquants
      acronym: dept.description ?? null,
      color: null,
      icon: null
    }));
  } catch (error) {
    logger.error("Erreur lors de la récupération des départements:", error);
    return [];
  }
} 