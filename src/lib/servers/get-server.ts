import { unauthorized } from "next/navigation";
import { auth } from "../auth";
import type { AuthPermission, AuthRole } from "../auth/auth-permissions";
import { getSession } from "../auth/auth-user";
import { isInRoles } from "./is-in-roles";
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

type ServerParams = {
  roles?: AuthRole[];
  permissions?: AuthPermission;
};

export const getCurrentServer = async (params?: ServerParams) => {
  const user = await getSession();
  const { headers } = await getHeadersModule();

  if (!user) {
    return null;
  }

  // Note: We still use activeOrganizationId since the database field name hasn't changed
  const server = await auth.api.getFullOrganization({
    headers: await headers(),
    query: {
      organizationId: user.session.activeOrganizationId ?? undefined,
    },
  });

  if (!server) {
    return null;
  }

  const memberRoles = server.members
    .filter((member) => member.userId === user.session.userId)
    .map((member) => member.role);

  if (memberRoles.length === 0 || !isInRoles(memberRoles, params?.roles)) {
    return null;
  }

  if (params?.permissions) {
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permission: params.permissions,
      },
    });

    if (!hasPermission.success) {
      return null;
    }
  }

  return {
    ...server,
    user: user.user,
    email: (server.email ?? null) as string | null,
    memberRoles: memberRoles,
  };
};

export type CurrentServerPayload = NonNullable<
  Awaited<ReturnType<typeof getCurrentServer>>
>;

export const getRequiredCurrentServer = async (params?: ServerParams) => {
  const result = await getCurrentServer(params);

  if (!result) {
    unauthorized();
  }

  return result;
};
