import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { getRequiredServerBySlug } from "@/lib/db/server-db";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: { serverSlug: string } }
) {
  try {
    // Vérifier l'authentification et récupérer l'utilisateur

    const { serverSlug } = await params;
    const user = await getRequiredUser();
    const server = await getRequiredServerBySlug(serverSlug);

    // Récupérer les données de la requête
    const { permissions, mode = "OR" } = await req.json();

    // Vérifier que permissions est bien défini
    if (!permissions) {
      return NextResponse.json(
        { error: "Permissions not provided" },
        { status: 400 }
      );
    }

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

    // Les rôles owner et admin ont toujours toutes les permissions
    if (member?.role === "owner" || member?.role === "admin") {
      return NextResponse.json({ granted: true });
    }

    // Si l'utilisateur n'a pas de rôle personnalisé, retourner false
    if (!member?.customRole?.permissions) {
      return NextResponse.json({ granted: false });
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
        return NextResponse.json({ granted: true });
      }

      // Vérifier les permissions demandées
      let granted = false;
      
      if (typeof permissions === "string") {
        // Cas d'une seule permission
        granted = userPermissions.includes(permissions);
      } else if (Array.isArray(permissions)) {
        // Cas d'un tableau de permissions
        if (mode === "AND") {
          // Toutes les permissions sont requises
          granted = permissions.every(p => userPermissions.includes(p));
        } else {
          // Au moins une permission est requise
          granted = permissions.some(p => userPermissions.includes(p));
        }
      }

      return NextResponse.json({ granted });
    } catch (e) {
      logger.error("Error parsing permissions:", { error: e });
      return NextResponse.json({ granted: false });
    }
  } catch (error) {
    logger.error("Error checking permissions:", { error });
    return NextResponse.json(
      { error: "Failed to check permissions" },
      { status: 500 }
    );
  }
} 