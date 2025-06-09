"use client";

import type { ReactNode} from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

// Types pour les props
type CheckPermissionProps = {
  permissions: string | string[];
  mode?: "AND" | "OR";
  fallback?: ReactNode;
  children: ReactNode;
  redirect?: string;
};

/**
 * Composant pour vérifier les permissions côté client
 * 
 * @example
 * <CheckPermission permissions="EDIT_CITIZENS">
 *   <Button>Modifier</Button>
 * </CheckPermission>
 * 
 * @example
 * <CheckPermission 
 *   permissions={["CREATE_CITIZENS", "EDIT_CITIZENS"]} 
 *   mode="OR"
 *   fallback={<p>Vous n'avez pas les permissions nécessaires</p>}
 * >
 *   <Button>Action</Button>
 * </CheckPermission>
 */
export default function CheckPermission({ 
  permissions, 
  mode = "OR", 
  fallback = null, 
  children,
  redirect
}: CheckPermissionProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const params = useParams<{ serverSlug: string }>();
  const router = useRouter();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Appeler l'API pour vérifier les permissions
        const response = await fetch(`/api/servers/${params.serverSlug}/check-permission`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            permissions,
            mode,
          }),
        });

        if (!response.ok) {
          setHasPermission(false);
          return;
        }

        const { granted } = await response.json();
        
        if (redirect && !granted) {
          router.push(redirect);
          return;
        }
        
        setHasPermission(granted);
      } catch (error) {
        logger.error("Error checking permissions:", { error });
        setHasPermission(false);
      }
    };

    if (params.serverSlug) {
      void checkPermission();
    }
  }, [params.serverSlug, permissions, mode, redirect, router]);

  // Pendant le chargement, on ne montre rien
  if (hasPermission === null) {
    return null;
  }

  // Si l'utilisateur a la permission, on affiche les enfants
  if (hasPermission) {
    return <>{children}</>;
  }

  // Sinon, on affiche le fallback
  return <>{fallback}</>;
} 