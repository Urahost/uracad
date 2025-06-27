"use client";

import type { ReactNode } from "react";
import { usePermissions } from "./permissions-provider";

// Types pour les props
type CheckPermissionProps = {
  permissions: string | string[];
  mode?: "AND" | "OR";
  fallback?: ReactNode;
  children: ReactNode;
  redirect?: string;
};

/**
 * Composant pour vérifier les permissions côté client (via contexte)
 */
export default function CheckPermission({ 
  permissions, 
  mode = "OR", 
  fallback = null, 
  children,
  redirect
}: CheckPermissionProps) {
  const { permissions: perms, isLoading } = usePermissions();

  // Pendant le chargement, on ne montre rien
  if (isLoading) {
    return null;
  }

  // Normalise permissions en tableau
  const permsToCheck = Array.isArray(permissions) ? permissions : [permissions];

  // Vérifie les permissions selon le mode
  let granted = false;
  if (mode === "AND") {
    granted = permsToCheck.every((perm) => perms[perm]);
  } else {
    granted = permsToCheck.some((perm) => perms[perm]);
  }

  // Redirection si demandé (à gérer côté page si besoin)
  // if (redirect && !granted) { ... }

  if (granted) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
} 