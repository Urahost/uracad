"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarNavigationMenu } from "@/components/ui/sidebar-utils";
import type { NavigationGroup } from "@/features/navigation/navigation.type";
import { SidebarUserButton } from "@/features/sidebar/sidebar-user-button";
import { ChevronDown } from "lucide-react";
import { getAccountNavigation } from "./account.links";
import { ServersSelect } from "../../servers/[serverSlug]/(navigation)/_navigation/server-select";
import type { Organization } from "@prisma/client";
import type { AuthRole } from "@/lib/auth/auth-permissions";

// Type local pour AuthServer basé sur l'utilisation dans ServersSelect
type AuthServer = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  image?: string | null;
  memberRoles: AuthRole[];
  createdAt: Date;
  metadata: string | null;
  email: string | null;
  colorsTheme: string | null;
};

export function AccountSidebar({ userServers }: { userServers: Organization[] }) {
  const links: NavigationGroup[] = getAccountNavigation();
  
  // Convertir les serveurs au format attendu
  const servers = userServers.map(server => ({
    id: server.id,
    name: server.name,
    slug: server.slug,
    logo: server.logo,
    image: server.logo,
    memberRoles: [] as AuthRole[],
    createdAt: server.createdAt,
    metadata: server.metadata,
    email: server.email,
    colorsTheme: server.metadata ? JSON.parse(server.metadata).colorsTheme ?? null : null
  })) satisfies AuthServer[];

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <ServersSelect servers={servers} />
      </SidebarHeader>
      <SidebarContent>
        {links.map((link) => (
          <SidebarGroup key={link.title}>
            <SidebarGroupLabel>
              {link.title}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarNavigationMenu link={link} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        <SidebarUserButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
