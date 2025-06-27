"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
// Remove import of server action and implement locally
// import { hasPermission } from "./permissions.action";

// Type du contexte
export type PermissionsContextType = {
  permissions: Record<string, boolean>;
  isLoading: boolean;
};

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: {},
  isLoading: true,
});

export function PermissionsProvider({ requiredPermissions, children }: { requiredPermissions: string[]; children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams<{ serverSlug: string }>();

  useEffect(() => {
    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
      setPermissions({});
      setIsLoading(false);
      return;
    }
    async function fetchPermissions() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/servers/${params.serverSlug}/check-permission`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: requiredPermissions, mode: "BULK" }),
        });
        const data = await res.json();
        setPermissions(data.results ?? {});
      } catch (e) {
        setPermissions({});
      } finally {
        setIsLoading(false);
      }
    }
    void fetchPermissions();
  }, [requiredPermissions, params.serverSlug]);

  return (
    <PermissionsContext.Provider value={{ permissions, isLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
} 