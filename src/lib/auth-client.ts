import {
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getServerUrl } from "./server-url"; 

export const authClient = createAuthClient({
  baseURL: getServerUrl(),
  plugins: [
    magicLinkClient(),
    organizationClient(),
  ],
});

export type AuthClientType = typeof authClient;

export const { useSession, signIn, signOut, signUp } = authClient;
