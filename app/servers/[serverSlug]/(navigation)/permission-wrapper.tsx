import { PermissionMiddleware } from "./permission-middleware";
import type { PropsWithChildren } from "react";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { logger } from "@/lib/logger";

type PermissionWrapperProps = PropsWithChildren & {
  serverSlug: string;
};

export async function PermissionWrapper({ 
  children,
  serverSlug,
}: PermissionWrapperProps) {
  const user = await getRequiredUser();
  const server = await getRequiredCurrentServerCache();
  
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
    }
  });

  // Vérifier si l'utilisateur est admin ou owner
  const isPowerUser = member?.role === "admin" || member?.role === "owner";

  let userPermissions: string[] = [];
  
  // Si l'utilisateur n'est pas un power user, on récupère ses permissions personnalisées
  if (!isPowerUser && member?.customRole?.permissions) {
    try {
      const permissionsObject = JSON.parse(member.customRole.permissions);
      userPermissions = Object.entries(permissionsObject)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);
    } catch (e) {
      logger.error("Error parsing permissions:", e);
    }
  }

  // Si l'utilisateur est un power user, on lui donne toutes les permissions
  if (isPowerUser) {
    userPermissions = ["ADMINISTRATOR"];
  }

  return (
    <PermissionMiddleware 
      serverSlug={serverSlug} 
      isPowerUser={isPowerUser}
      userPermissions={userPermissions}
    >
      {children}
    </PermissionMiddleware>
  );
} 