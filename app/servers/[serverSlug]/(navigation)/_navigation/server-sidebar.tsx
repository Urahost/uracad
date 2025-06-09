"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import type { AuthRole } from "@/lib/auth/auth-permissions";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";  
import { ServersSelect } from "./server-select";
import { getServerNavigation } from "./server-navigation.links";
import { logger } from "@/lib/logger";
import { ServerCommand } from "./server-command";
import type { Organization } from "@prisma/client";


export function ServerSidebar({
  slug,
  userServers,
  roles,
}: {
  slug: string;
  roles: AuthRole[] | undefined;
  userServers: Organization[];
}) {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`/api/servers/${slug}/check-permission/user-permissions`);
        
        if (!response.ok) {
          setUserPermissions([]);
          return;
        }
        
        const { permissions } = await response.json();
        setUserPermissions(permissions ?? []);
      } catch (error) {
        logger.error("Failed to fetch user permissions:", { error });
        setUserPermissions([]);
      }
    };
    
    void fetchPermissions();
  }, [slug]);

  const links: NavigationGroup[] = getServerNavigation(slug, roles, userPermissions);

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex flex-col gap-2">
        <ServersSelect servers={userServers} currentserverSlug={slug} />
        <ServerCommand />
      </SidebarHeader>
      <SidebarContent>
        {links.map((link) => (
          <ItemCollapsing
            defaultOpenStartPath={link.defaultOpenStartPath}
            key={link.title}
          >
            <SidebarGroup key={link.title}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  {link.title}
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarNavigationMenu link={link} />
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </ItemCollapsing>
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        <SidebarUserButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

const ItemCollapsing = (
  props: PropsWithChildren<{ defaultOpenStartPath?: string }>,
) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isOpen = props.defaultOpenStartPath
    ? pathname.startsWith(props.defaultOpenStartPath)
    : true;

  useEffect(() => {
    if (isOpen) {
      setOpen(isOpen);
    }
  }, [isOpen]);
  return (
    <Collapsible
      defaultOpen={isOpen}
      onOpenChange={setOpen}
      open={open}
      className="group/collapsible"
    >
      {props.children}
    </Collapsible>
  );
};