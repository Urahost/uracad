import { RolesManagement } from "./roles-management";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import type { Role } from "./types";

// Composant de fallback pendant le chargement
function RolesSkeleton() {
  return (
    <div className="p-4 border rounded-lg animate-pulse">
      <div className="h-6 w-64 bg-muted rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-5/6 bg-muted rounded"></div>
        <div className="h-4 w-4/6 bg-muted rounded"></div>
      </div>
    </div>
  );
}

export default async function RolesPage(
  props: PageParams<{ serverSlug: string }>,
) {
  // Attendre les paramètres avant de les utiliser
  const params = await props.params;
  const serverSlug = params.serverSlug;

  const server = await getRequiredCurrentServerCache({
    roles: ["owner", "admin"],
  });

  // Récupérer tous les rôles du serveur
  const roles = await prisma.customRole
    .findMany({
      where: {
        organizationId: server.id,
      },
      orderBy: {
        position: "asc",
      },
    })
    .then((roles) =>
      roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description ?? null,
        color: role.color ?? null,
        permissions: role.permissions ? JSON.parse(role.permissions) : [],
        position: role.position,
        departmentId: role.departmentId ?? null,
      } as Role)),
    );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestion des rôles</h1>
        <p className="text-muted-foreground">
          Gérez les rôles et leurs permissions sur votre serveur.
        </p>
      </div>

      {/* Utiliser Suspense pour éviter les requêtes anticipées */}
      <Suspense fallback={<RolesSkeleton />}>
        <RolesManagement 
          roles={roles} 
          serverId={serverSlug}
        />
      </Suspense>
    </div>
  );
}
