import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

// Helper to check if code is running on server or client
const isServer = typeof window === 'undefined';

// Dynamic import for headers to avoid static import errors in pages directory
const getHeadersModule = async () => {
  if (isServer) {
    try {
      // Dynamic import only on server
      const { headers } = await import("next/headers");
      return { headers };
    } catch (error) {
      logger.error("Could not import next/headers, falling back to empty headers", { error });
      return { headers: () => new Headers() };
    }
  }
  return { headers: () => new Headers() };
};

export async function getUsersServers() {
  const { headers } = await getHeadersModule();
  
  const userServers = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return userServers;
}
