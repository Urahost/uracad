"use client";

import { createContext, useContext } from "react";
// Remove import of server action and implement locally
// import { hasPermission } from "./permissions.action";

type PermissionsContextType = {
  permissions: string[];
  roles: string[];
  hasPermission: (permission: string | string[], mode?: "AND" | "OR") => boolean;
};

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
  roles: [],
  hasPermission: () => false,
});

export const usePermissions = () => useContext(PermissionsContext);

// Client-side implementation of hasPermission
function checkPermission(
  permission: string | string[],
  permissions: string[],
  roles: string[],
  mode: "AND" | "OR" = "OR"
): boolean {
  // Si l'utilisateur est owner ou admin, il peut tout faire
  if (roles.includes("OWNER") || roles.includes("ADMIN")) {
    return true;
  }
  
  // Vérifier si la liste contient ADMINISTRATOR (donne toutes les permissions)
  if (permissions.includes("ADMINISTRATOR")) {
    return true;
  }
  
  // Cas d'une seule permission
  if (typeof permission === "string") {
    return permissions.includes(permission);
  }
  
  // Cas d'un tableau de permissions
  if (mode === "AND") {
    // Toutes les permissions sont requises
    return permission.every(p => permissions.includes(p));
  } else {
    // Au moins une permission est requise
    return permission.some(p => permissions.includes(p));
  }
}

export function PermissionsProvider({
  children,
  permissions,
  roles = [],
}: {
  children: React.ReactNode;
  permissions: string[];
  roles?: string[];
}) {
  const contextValue = {
    permissions,
    roles,
    hasPermission: (permission: string | string[], mode: "AND" | "OR" = "OR") => 
      checkPermission(permission, permissions, roles, mode),
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
} 