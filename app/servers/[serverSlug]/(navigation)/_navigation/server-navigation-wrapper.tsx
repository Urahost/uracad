import { getRequiredCurrentServerCache, getUserPermissionsCache } from "@/lib/react/cache";
import { getUsersServers } from "@/query/server/get-users-servers.query";
import type { PropsWithChildren } from "react";
import { ServerNavigation } from "./server-navigation";

export async function ServerNavigationWrapper({ 
  children 
}: PropsWithChildren) {
  // Fetch all the data on the server
  const serverData = await getRequiredCurrentServerCache();
  const userServersData = await getUsersServers();
  const userPermissions = await getUserPermissionsCache();

  // Ensure the server object has the required structure
  const server = {
    id: serverData.id,
    name: serverData.name,
    slug: serverData.slug || '', 
    logo: serverData.logo ?? null,
    memberRoles: Array.isArray(serverData.memberRoles) 
      ? serverData.memberRoles.map(role => 
          typeof role === 'string' ? role as "owner" | "admin" | "member" : "member"
        )
      : []
  };

  // Ensure userServers have the correct structure
  const userServers = userServersData.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug || '',
    logo: s.logo ?? null,
    createdAt: s.createdAt,
    metadata: s.metadata ?? null,
    email: s.email ?? null,
    colorsTheme: s.metadata ? JSON.parse(s.metadata).colorsTheme ?? null : null
  }));

  // Pass the data to the client component
  return (
    <ServerNavigation
      server={server}
      userServers={userServers}
      userPermissions={userPermissions}
    >
      {children}
    </ServerNavigation>
  );
} 