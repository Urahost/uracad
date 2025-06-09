"use server";

import { serverAction } from "@/lib/actions/safe-actions";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { 
  JudicialCaseSchema, 
  JudicialCaseUpdateSchema, 
  DeleteJudicialCaseSchema,
  ToggleLockCaseSchema,
  CloseCaseSchema 
} from "./judicial-case.schema";
import type { 
  JudicialCaseSchemaType, 
  JudicialCaseUpdateSchemaType, 
  DeleteJudicialCaseSchemaType,
  ToggleLockCaseSchemaType,
  CloseCaseSchemaType
} from "./judicial-case.schema";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

// Action pour créer un dossier judiciaire
export async function createJudicialCaseAction(data: JudicialCaseSchemaType) {
  return serverAction
    .schema(JudicialCaseSchema)
    .metadata({ customPermissions: ["CREATE_JUDICIAL_CASE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      const user = await getRequiredUser();
      
      // Récupérer le citoyen pour vérifier s'il existe
      const citizen = await prisma.citizen.findUnique({
        where: {
          id: input.citizenId,
        },
      });

      if (!citizen) {
        throw new Error("Citoyen introuvable");
      }

      try {
        // Générer un numéro de dossier basé sur la date et la catégorie si non fourni
        const caseNumber = input.caseNumber ??
          `${input.category.substring(0, 3)}-${Date.now().toString().slice(-6)}`;

        // Convertir le tableau de documents en chaîne JSON si présent
        const documents = input.documents ? JSON.stringify(input.documents) : undefined;

        // Créer le dossier judiciaire
        const judicialCase = await prisma.judicialCase.create({
          data: {
            caseNumber,
            citizenId: input.citizenId,
            title: input.title,
            description: input.description,
            category: input.category,
            status: input.status,
            charges: input.charges,
            verdict: input.verdict,
            sentenceDetails: input.sentenceDetails,
            judgeName: input.judgeName,
            filingDate: new Date(input.filingDate),
            hearingDate: input.hearingDate ? new Date(input.hearingDate) : undefined,
            documents,
            isSealed: input.isSealed,
            isSensitive: input.isSensitive,
            createdById: user.id,
            createdByName: input.createdByName,
            createdByDept: input.createdByDept,
            organizationId: server.id,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${input.citizenId}`);
        return judicialCase;
      } catch (error) {
        logger.error("Erreur lors de la création du dossier judiciaire:", error);
        throw new Error(`Impossible de créer le dossier judiciaire: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
}

// Action pour mettre à jour un dossier judiciaire
export async function updateJudicialCaseAction(data: JudicialCaseUpdateSchemaType) {
  return serverAction
    .schema(JudicialCaseUpdateSchema)
    .metadata({ customPermissions: ["EDIT_JUDICIAL_CASE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer le dossier pour vérifier s'il existe
      const existingCase = await prisma.judicialCase.findFirst({
        where: {
          id: input.id,
          organizationId: server.id,
        },
      });

      if (!existingCase) {
        throw new Error("Dossier judiciaire introuvable");
      }

      try {
        // Convertir le tableau de documents en chaîne JSON si présent
        const documents = input.documents ? JSON.stringify(input.documents) : undefined;

        // Mettre à jour le dossier judiciaire
        const updatedCase = await prisma.judicialCase.update({
          where: {
            id: input.id,
          },
          data: {
            title: input.title,
            description: input.description,
            category: input.category,
            status: input.status,
            charges: input.charges,
            verdict: input.verdict,
            sentenceDetails: input.sentenceDetails,
            judgeName: input.judgeName,
            filingDate: input.filingDate ? new Date(input.filingDate) : undefined,
            hearingDate: input.hearingDate ? new Date(input.hearingDate) : undefined,
            closedDate: input.status === "CLOSED" ? new Date() : existingCase.closedDate,
            documents,
            isSealed: input.isSealed,
            isSensitive: input.isSensitive,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${input.citizenId}`);
        return updatedCase;
      } catch (error) {
        logger.error("Erreur lors de la mise à jour du dossier judiciaire:", error);
        throw new Error(`Impossible de mettre à jour le dossier judiciaire: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
}

// Action pour supprimer un dossier judiciaire
export async function deleteJudicialCaseAction(data: DeleteJudicialCaseSchemaType) {
  return serverAction
    .schema(DeleteJudicialCaseSchema)
    .metadata({ customPermissions: ["DELETE_JUDICIAL_CASE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer le dossier pour vérifier s'il existe
      const existingCase = await prisma.judicialCase.findFirst({
        where: {
          id: input.id,
          organizationId: server.id,
        },
        include: {
          citizen: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!existingCase) {
        throw new Error("Dossier judiciaire introuvable");
      }

      try {
        // Supprimer le dossier judiciaire
        await prisma.judicialCase.delete({
          where: {
            id: input.id,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${existingCase.citizen.id}`);
        return { success: true };
      } catch (error) {
        logger.error("Erreur lors de la suppression du dossier judiciaire:", error);
        throw new Error(`Impossible de supprimer le dossier judiciaire: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
}

// Action pour verrouiller/déverrouiller un dossier judiciaire
export async function toggleJudicialCaseLockAction(data: ToggleLockCaseSchemaType) {
  return serverAction
    .schema(ToggleLockCaseSchema)
    .metadata({ customPermissions: ["EDIT_JUDICIAL_CASE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();

      try {
        const existingCase = await prisma.judicialCase.findFirst({
          where: {
            id: input.id,
            organizationId: server.id,
          },
          include: {
            citizen: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!existingCase) {
          throw new Error("Dossier judiciaire introuvable");
        }

        const updatedCase = await prisma.judicialCase.update({
          where: {
            id: input.id,
          },
          data: {
            isSealed: input.isSealed,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${existingCase.citizen.id}`);
        return updatedCase;
      } catch (error) {
        logger.error("Erreur lors du verrouillage/déverrouillage du dossier judiciaire:", error);
        throw new Error(`Impossible de modifier le statut de verrouillage du dossier: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
}

// Action pour clôturer une procédure judiciaire
export async function closeJudicialCaseAction(data: CloseCaseSchemaType) {
  return serverAction
    .schema(CloseCaseSchema)
    .metadata({ customPermissions: ["CLOSE_PROCEDURE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();

      try {
        const existingCase = await prisma.judicialCase.findFirst({
          where: {
            id: input.id,
            organizationId: server.id,
          },
          include: {
            citizen: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!existingCase) {
          throw new Error("Dossier judiciaire introuvable");
        }

        const updatedCase = await prisma.judicialCase.update({
          where: {
            id: input.id,
          },
          data: {
            status: "CLOSED",
            closedDate: new Date(),
            verdict: input.verdict,
            sentenceDetails: input.sentenceDetails,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${existingCase.citizen.id}`);
        return updatedCase;
      } catch (error) {
        logger.error("Erreur lors de la clôture de la procédure:", error);
        throw new Error(`Impossible de clôturer la procédure: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
} 