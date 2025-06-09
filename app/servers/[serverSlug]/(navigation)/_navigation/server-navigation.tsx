"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Layout } from "@/features/page/layout";
import type { PropsWithChildren } from "react";
import { ServerSidebar } from "./server-sidebar"; 
import ServerBreadcrumb from "./server-breadcrumb";
import { PermissionsProvider } from "../permissions/permissions-provider";

// Define valid role types
type AuthRole = "member" | "admin" | "owner";

// Simplified Organization type
type ServerOrganization = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  createdAt: Date;
  metadata: string | null;
  email: string | null;
  colorsTheme: string | null;
};

// Custom type that extends Organization with required properties
type ServerWithRoles = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  memberRoles: AuthRole[];
};

// Props to receive data from server component
type ServerNavigationProps = PropsWithChildren & {
  server: ServerWithRoles;
  userServers: ServerOrganization[];
  userPermissions: string[];
};

// Client component that receives data as props
export function ServerNavigation({ 
  children, 
  server, 
  userServers, 
  userPermissions 
}: ServerNavigationProps) {
  const mappedServers = userServers.map(server => ({
    ...server,
    colorsTheme: server.metadata ? JSON.parse(server.metadata).colorsTheme ?? null : null
  }));

  return (
    <PermissionsProvider 
      permissions={userPermissions}
      roles={server.memberRoles}
    >
      <SidebarProvider>
        <ServerSidebar
          slug={server.slug}
          roles={server.memberRoles}
          userServers={mappedServers}
        />
        <SidebarInset className="border-accent border">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <Layout size="lg" className="flex items-center gap-2">
              <SidebarTrigger
                size="lg"
                variant="outline"
                className="size-9 cursor-pointer"
              />
              <ServerBreadcrumb />
            </Layout>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PermissionsProvider>
  );
}
