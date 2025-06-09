import { z } from "zod";

// Schema pour la création d'une infraction du code pénal
export const PenalCodeCreateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  minFine: z.number().nonnegative(),
  maxFine: z.number().nonnegative(),
  licensePoints: z.number().int().min(0).optional(),
  jailTime: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export type PenalCodeCreateSchemaType = z.infer<typeof PenalCodeCreateSchema>;

// Schéma pour la mise à jour d'une infraction du code pénal
export const PenalCodeUpdateSchema = z.object({
  id: z.string(),
  code: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  minFine: z.number().nonnegative().optional(),
  maxFine: z.number().nonnegative().optional(),
  licensePoints: z.number().int().min(0).optional(),
  jailTime: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export type PenalCodeUpdateSchemaType = z.infer<typeof PenalCodeUpdateSchema>; 