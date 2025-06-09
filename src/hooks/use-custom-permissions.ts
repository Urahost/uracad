"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { logger } from "@/lib/logger";

type CustomRoleWithPermissions = {
  id: string;
  name: string;
  permissions: string; // JSON string of permissions
};

export function useCustomPermissions() {
  const { data: session } = useSession();
  const params = useParams<{ serverSlug: string }>();
  const [userPermissions, setUserPermissions] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user || !params.serverSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Récupérer le rôle personnalisé de l'utilisateur pour ce serveur
        const response = await fetch(
          `/api/servers/${params.serverSlug}/me/role`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user role");
        }

        const roleData: CustomRoleWithPermissions = await response.json();

        // Si l'utilisateur a un rôle, analyser les permissions
        try {
          const permissionsObject = JSON.parse(roleData.permissions);
          setUserPermissions(permissionsObject);
        } catch (e) {
          logger.error("Error parsing permissions:", e);
          setUserPermissions({});
        }
      } catch (error) {
        logger.error("Error fetching user role:", error);
        setUserPermissions({});
      } finally {
        setLoading(false);
      }
    };

    void fetchUserRole();
  }, [session, params.serverSlug]);

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permissionId: string) => {
    // Les administrateurs ont toutes les permissions
    if (userPermissions.ADMINISTRATOR) {
      return true;
    }

    return !!userPermissions[permissionId];
  };

  // Vérifier spécifiquement la permission d'édition des citoyens
  const canEditCitizens = () => {
    return hasPermission("EDIT_CITIZENS");
  };

  return {
    loading,
    hasPermission,
    canEditCitizens,
    permissions: userPermissions,
  };
}
