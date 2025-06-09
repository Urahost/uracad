import { getRequiredUser } from "@/lib/auth/auth-user";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const server = await getRequiredCurrentServerCache();
    // Vérifier l'authentification et récupérer l'utilisateur
    const user = await getRequiredUser();

    // Récupérer le membre avec son rôle personnalisé
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

    // Si l'utilisateur n'a pas de rôle personnalisé, retourner un tableau vide
    if (!member?.customRole?.permissions) {
      return NextResponse.json({ permissions: [] });
    }

    try {
      // Analyser les permissions JSON
      const permissionsObject = JSON.parse(member.customRole.permissions);
      
      // Convertir l'objet de permissions en tableau
      const userPermissions = Object.entries(permissionsObject)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

      return NextResponse.json({ permissions: userPermissions });
    } catch (e) {
      logger.error("Error parsing permissions:", { error: e });
      return NextResponse.json({ permissions: [] });
    }
  } catch (error) {
    logger.error("Error getting user permissions:", { error });
    return NextResponse.json(
      { error: "Failed to get user permissions" },
      { status: 500 }
    );
  }
} 