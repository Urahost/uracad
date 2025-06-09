import { z } from "zod";

// Schéma pour la création d'une amende
export const FineCreateSchema = z.object({
  citizenId: z.string(),
  amount: z.number().min(0, "Le montant doit être positif"),
  reason: z.string().min(1, "La raison est requise"),
  issuedByName: z.string().min(1, "Le nom de l'agent est requis"),
  issuedByDept: z.string().min(1, "Le département est requis"),
  location: z.string().optional(),
  licensePoints: z.number().min(0).default(0),
  jailTime: z.number().min(0).default(0),
  notes: z.string().optional(),
  penalCodeId: z.string().optional(),
  vehicleId: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "CONTESTED"]).default("PENDING"),
});

// Types pour TypeScript
export type FineCreateSchemaType = z.infer<typeof FineCreateSchema>;

// Schéma pour la mise à jour d'une amende
export const FineUpdateSchema = z.object({
  id: z.string(),
  amount: z.number().min(0, "Le montant doit être positif").optional(),
  reason: z.string().min(1, "La raison est requise").optional(),
  issuedByName: z.string().min(1, "Le nom de l'agent est requis").optional(),
  issuedByDept: z.string().min(1, "Le département est requis").optional(),
  location: z.string().optional(),
  licensePoints: z.number().min(0).optional(),
  jailTime: z.number().min(0).optional(),
  notes: z.string().optional(),
  penalCodeId: z.string().optional(),
  vehicleId: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "CONTESTED"]).optional(),
});

export type FineUpdateSchemaType = z.infer<typeof FineUpdateSchema>;

// Schéma pour le paiement d'une amende
export const FinePaymentSchema = z.object({
  id: z.string(),
  status: z.enum(["PAID", "CONTESTED"]),
});

export type FinePaymentSchemaType = z.infer<typeof FinePaymentSchema>; 