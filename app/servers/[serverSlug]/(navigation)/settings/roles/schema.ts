import { z } from "zod";

/**
 * Schéma pour la création/édition d'un rôle personnalisé
 */
export const RoleSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().nullable(),
  color: z.string().nullable(),
  permissions: z.array(z.string()),
  departmentId: z.string().nullable(),
});

export type RoleSchemaType = z.infer<typeof RoleSchema>; 