"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Organization } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

type ServersSelectProps = {
  currentserverSlug?: string;
  children?: ReactNode;
  servers: Organization[];
};

export const ServersSelect = (props: ServersSelectProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const server = props.servers.find((server) => server.slug === props.currentserverSlug);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              data-testid="server-selector"
              variant="default"
              size="lg"
            >
              {server ? (
                <span className="inline-flex w-full items-center gap-2">
                  <Avatar className="size-6 object-contain">
                    <AvatarFallback>
                      {server.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                    {server.logo ? <AvatarImage src={server.logo} /> : null}
                  </Avatar>
                  <span className="line-clamp-1 text-left">{server.name}</span>
                </span>
              ) : (
                <span>Open server</span>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
            {props.servers
              .filter((server) => server.slug !== props.currentserverSlug)
              .map((server) => {
                if (typeof window === "undefined") return null;

                const href = props.currentserverSlug
                  ? pathname.replace(
                      `/servers/${props.currentserverSlug}`,
                      `/servers/${server.slug}`,
                    )
                  : `/servers/${server.slug}`;

                return (
                  <DropdownMenuItem key={server.slug} asChild>
                    <Link
                      href={href}
                      key={server.slug}
                      className="inline-flex w-full items-center gap-2"
                    >
                      <Avatar className="size-6">
                        <AvatarFallback>
                          {server.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                        {server.logo ? <AvatarImage src={server.logo} /> : null}
                      </Avatar>
                      <span className="line-clamp-1 text-left">{server.name}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            <DropdownMenuItem
              onClick={() => {
                router.push("/servers/new");
              }}
            >
              <Plus className="mr-2 size-6" />
              <span className="line-clamp-1 text-left">
                Add a new server
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
