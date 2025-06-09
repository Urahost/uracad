import { z } from "zod";

// Schéma pour la création d'un mandat
export const WarrantSchema = z.object({
  citizenId: z.string(),
  warrantNumber: z.string().optional(),
  type: z.enum(["ARREST", "SEARCH", "OTHER"]),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  reason: z.string().min(1, "La raison est requise"),
  issuedDate: z.string(), // Date au format ISO string
  expirationDate: z.string().optional(), // Date au format ISO string
  issuedByName: z.string().min(1, "Le nom du juge est requis"),
  issuedByDept: z.string().min(1, "Le département est requis"),
  status: z.enum(["ACTIVE", "EXECUTED", "EXPIRED", "CANCELLED"]).default("ACTIVE"),
  notes: z.string().optional(),
  address: z.string().optional(),
  judicialCaseId: z.string().optional(),
});

// Types pour TypeScript
export type WarrantSchemaType = z.infer<typeof WarrantSchema>;

// Schéma pour la mise à jour d'un mandat
export const WarrantUpdateSchema = z.object({
  id: z.string(),
  type: z.enum(["ARREST", "SEARCH", "OTHER"]).optional(),
  title: z.string().min(1, "Le titre est requis").optional(),
  description: z.string().min(1, "La description est requise").optional(),
  reason: z.string().min(1, "La raison est requise").optional(),
  expirationDate: z.string().optional(), // Date au format ISO string
  status: z.enum(["ACTIVE", "EXECUTED", "EXPIRED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
  address: z.string().optional(),
  executedDetails: z.string().optional(),
  executedDate: z.string().optional(), // Date au format ISO string
  executedByName: z.string().optional(),
  executedByDept: z.string().optional(),
});

export type WarrantUpdateSchemaType = z.infer<typeof WarrantUpdateSchema>;

// Schéma pour l'exécution d'un mandat
export const ExecuteWarrantSchema = z.object({
  id: z.string(),
  executedDetails: z.string().min(1, "Les détails d'exécution sont requis"),
  executedByName: z.string().min(1, "Le nom de l'agent est requis"),
  executedByDept: z.string().min(1, "Le département est requis"),
});

export type ExecuteWarrantSchemaType = z.infer<typeof ExecuteWarrantSchema>;

// Schéma pour la suppression d'un mandat
export const DeleteWarrantSchema = z.object({
  id: z.string(),
});

export type DeleteWarrantSchemaType = z.infer<typeof DeleteWarrantSchema>; 