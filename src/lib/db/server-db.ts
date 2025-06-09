
import { unauthorized } from "next/navigation";
import { prisma } from "../prisma";
import { logger } from "../logger";

/**
 * Récupère un serveur par son slug
 * @param slug Slug du serveur
 * @returns Server data
 */
export async function getServerBySlug(slug: string) {
  try {
    const server = await prisma.organization.findFirst({
      where: {
        slug,
      },
    });

    return server;
  } catch (error) {
    logger.error("Error fetching server by slug:", error);
    return null;
  }
}

/**
 * Récupère un serveur par son slug, lance une erreur si inexistant
 * @param slug Slug du serveur
 * @returns Server data
 */
export async function getRequiredServerBySlug(slug: string) {
  const server = await getServerBySlug(slug);
  
  if (!server) {
    unauthorized();
  }
  
  return server;
} 