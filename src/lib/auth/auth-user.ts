import { unauthorized } from "next/navigation";
import { auth } from "../auth";
import { logger } from "../logger";
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
      // If we're in pages directory, headers won't be available
      logger.error("Could not import next/headers, falling back to empty headers", { error });
      return { headers: () => new Headers() };
    }
  }
  return { headers: () => new Headers() };
};

// Server-only version that uses headers()
export const getServerSession = async () => {
  const { headers } = await getHeadersModule();
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};

// Universal version that can be used in both client and server components
export const getSession = async () => {
  // On the server, use headers()
  if (isServer) {
    return getServerSession();
  }
  
  // On the client, don't pass headers
  const session = await auth.api.getSession({
    headers: new Headers(),
  });
  return session;
};

export const getUser = async () => {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  return user;
};

export const getRequiredUser = async () => {
  const user = await getUser();

  if (!user) {
    unauthorized();
  }

  return user;
};
