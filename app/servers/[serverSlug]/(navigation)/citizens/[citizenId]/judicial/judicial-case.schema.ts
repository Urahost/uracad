import { z } from "zod";

// Schéma pour la création d'un dossier judiciaire
export const JudicialCaseSchema = z.object({
  citizenId: z.string(),
  caseNumber: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  category: z.string().min(1, "La catégorie est requise"),
  status: z.enum(["PENDING", "ACTIVE", "CLOSED", "DISMISSED"]).default("PENDING"),
  charges: z.string().optional(),
  verdict: z.string().optional(),
  sentenceDetails: z.string().optional(),
  judgeName: z.string().optional(),
  filingDate: z.string(), // Date au format ISO string
  hearingDate: z.string().optional(), // Date au format ISO string
  documents: z.array(z.string()).optional(),
  isSealed: z.boolean().default(false),
  isSensitive: z.boolean().default(false),
  createdByName: z.string().min(1, "Le nom du créateur est requis"),
  createdByDept: z.string().min(1, "Le département est requis"),
});

// Types pour TypeScript
export type JudicialCaseSchemaType = z.infer<typeof JudicialCaseSchema>;

// Schéma pour la mise à jour d'un dossier judiciaire
export const JudicialCaseUpdateSchema = z.object({
  id: z.string(),
  citizenId: z.string(),
  title: z.string().min(1, "Le titre est requis").optional(),
  description: z.string().min(1, "La description est requise").optional(),
  category: z.string().min(1, "La catégorie est requise").optional(),
  status: z.enum(["PENDING", "ACTIVE", "CLOSED", "DISMISSED"]).optional(),
  charges: z.string().optional(),
  verdict: z.string().optional(),
  sentenceDetails: z.string().optional(),
  judgeName: z.string().optional(),
  filingDate: z.string().optional(), // Date au format ISO string
  hearingDate: z.string().optional(), // Date au format ISO string
  documents: z.array(z.string()).optional(),
  isSealed: z.boolean().optional(),
  isSensitive: z.boolean().optional(),
});

export type JudicialCaseUpdateSchemaType = z.infer<typeof JudicialCaseUpdateSchema>;

// Schéma pour supprimer un dossier judiciaire
export const DeleteJudicialCaseSchema = z.object({
  id: z.string(),
});

export type DeleteJudicialCaseSchemaType = z.infer<typeof DeleteJudicialCaseSchema>;

// Schéma pour verrouiller/déverrouiller un dossier
export const ToggleLockCaseSchema = z.object({
  id: z.string(),
  isSealed: z.boolean(),
});

export type ToggleLockCaseSchemaType = z.infer<typeof ToggleLockCaseSchema>;

// Schéma pour clôturer un dossier
export const CloseCaseSchema = z.object({
  id: z.string(),
  verdict: z.string().optional(),
  sentenceDetails: z.string().optional(),
});

export type CloseCaseSchemaType = z.infer<typeof CloseCaseSchema>; 