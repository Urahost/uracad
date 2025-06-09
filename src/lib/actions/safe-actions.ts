import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { AuthPermissionSchema, RolesKeys } from "../auth/auth-permissions";
import { getRequiredUser } from "../auth/auth-user";
import { logger } from "../logger";
import { getRequiredCurrentServer } from "../servers/get-server";


export class ActionError extends Error {}

type handleServerError = (e: Error) => string;

const handleServerError: handleServerError = (e) => {
  if (e instanceof ActionError) {
    logger.debug("[DEV] - Action Error", e.message);
    return e.message;
  }

  logger.info("Unknown Error", e);

  if (process.env.NODE_ENV === "development") {
    return e.message;
  }

  return "An unexpected error occurred.";
};

export const action = createSafeActionClient({
  handleServerError,
});

export const authAction = createSafeActionClient({
  handleServerError,
}).use(async ({ next }) => {
  const user = await getRequiredUser();

  return next({
    ctx: {
      user: user,
    },
  });
});

// Define a simpler type for the server action
type ServerActionType = typeof serverAction & {
  permission: (permission: string | string[]) => typeof serverAction;
};

export const serverAction = createSafeActionClient({
  handleServerError,
  defineMetadataSchema() {
    return z
      .object({
        roles: z.array(z.enum(RolesKeys)).optional(),
        permissions: AuthPermissionSchema.optional(),
        // Support for custom permissions system
        customPermissions: z.union([
          z.string(),
          z.array(z.string())
        ]).optional(),
      })
      .optional();
  },
}).use(async ({ next, metadata = {} }) => {
  try {
    const server = await getRequiredCurrentServer(metadata);
    return next({
      ctx: server,
    });
  } catch {
    throw new ActionError(
      "You need to be part of a server to access this resource.",
    );
  }
});

// Add a permission method to serverAction for easier permission handling
(serverAction as ServerActionType).permission = function(permission: string | string[]) {
  return this.metadata({ 
    customPermissions: permission 
  });
};
