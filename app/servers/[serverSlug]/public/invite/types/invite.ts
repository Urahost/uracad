import { z } from "zod";
import { RolesKeys } from "@/lib/auth/auth-permissions";
import type { InviteLink as PrismaInviteLink, Organization } from "@prisma/client";

// Schéma pour la validation des invites
export const InviteSchema = z.object({
  code: z.string().min(1),
  role: z.enum(RolesKeys).default("member"),
  expiresIn: z.enum(["1h", "6h", "12h", "1d", "7d", "30d", "never"]).default("7d"),
  maxUses: z.enum(["1", "5", "10", "25", "50", "100", "unlimited"]).default("unlimited"),
});

export type InviteSchemaType = z.infer<typeof InviteSchema>;

// Type pour un lien d'invitation avec les relations
export type InviteLink = PrismaInviteLink & {
  organization: Pick<Organization, "slug" | "name" | "logo">;
  creator?: {
    name: string | null;
    image: string | null;
  } | null;
};

// Type pour une invite acceptée
export type AcceptedInvite = {
  id: string;
  inviteId: string;
  userId: string;
  role: string;
  acceptedAt: string;
  organizationId: string;
}

// Type pour les options d'expiration
export type ExpirationOption = {
  value: string;
  label: string;
  duration?: number; // en millisecondes
}

// Type pour les options d'utilisations maximales
export type MaxUsesOption = {
  value: string;
  label: string;
  maxUses?: number;
}

// Type pour le contexte des invites
export type InviteContextType = {
  invite: InviteLink | null;
  isLoading: boolean;
  error: Error | null;
  status: InviteStatus;
  actions: {
    acceptInvite: (code: string) => Promise<void>;
    validateInvite: (code: string) => Promise<void>;
  };
}

// Type pour le contexte des liens d'invitation (admin)
export type InviteLinksContextType = {
  links: InviteLink[];
  isLoading: boolean;
  error: Error | null;
  actions: {
    createLink: (data: InviteSchemaType) => Promise<void>;
    updateLink: (id: string, data: Partial<InviteLink>) => Promise<void>;
    deleteLink: (id: string) => Promise<void>;
    regenerateLink: (id: string) => Promise<void>;
    toggleLink: (id: string, isActive: boolean) => Promise<void>;
    copyLink: (url: string) => Promise<void>;
  };
}

// Type pour les réponses d'API
export type InviteResponse = {
  success: boolean;
  data?: InviteLink;
  error?: string;
}

// Classe d'erreur pour les invites
export class InviteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InviteError";
  }
}

// Type pour les statuts d'invite
export enum InviteStatus {
  VALID = "VALID",
  EXPIRED = "EXPIRED",
  USED = "USED",
  INACTIVE = "INACTIVE",
  INVALID = "INVALID",
} 