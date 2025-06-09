"use client";

import type { ReactNode} from "react";
import { useEffect } from "react";
import { usePermissions } from "./permissions-provider";
import { useRouter } from "next/navigation";

type PermissionCheckProps = {
  children: ReactNode;
  permission: string;
  fallback: string;
}

export function PermissionCheck({ children, permission, fallback }: PermissionCheckProps) {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  
  useEffect(() => {
    if (!hasPermission(permission)) {
      router.push(fallback);
    }
  }, [permission, fallback, hasPermission, router]);

  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
} 