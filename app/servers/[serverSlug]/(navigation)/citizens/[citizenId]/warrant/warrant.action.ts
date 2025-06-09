"use server";

import { serverAction } from "@/lib/actions/safe-actions";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { 
  WarrantSchema, 
  WarrantUpdateSchema, 
  ExecuteWarrantSchema,
  DeleteWarrantSchema
} from "./warrant.schema";
import type { 
  WarrantSchemaType, 
  WarrantUpdateSchemaType, 
  ExecuteWarrantSchemaType,
  DeleteWarrantSchemaType
} from "./warrant.schema";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

// Action pour créer un mandat
export async function createWarrantAction(data: WarrantSchemaType) {
  return serverAction
    .schema(WarrantSchema)
    .metadata({ customPermissions: ["CREATE_WARRANT_DRAFT"] })
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
        // Générer un numéro de mandat basé sur la date et le type si non fourni
        const warrantNumber = input.warrantNumber ?? 
          `${input.type.substring(0, 1)}-${Date.now().toString().slice(-6)}`;

        // Traiter "none" comme null pour judicialCaseId
        const judicialCaseId = input.judicialCaseId === "none" ? null : input.judicialCaseId;

        // Créer le mandat
        const warrant = await prisma.warrant.create({
          data: {
            warrantNumber,
            citizenId: input.citizenId,
            type: input.type,
            description: input.title,
            notes: input.reason,
            status: input.status,
            issuedDate: new Date(input.issuedDate),
            expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined,
            issuedById: user.id,
            issuedByName: input.issuedByName,
            issuedByDept: input.issuedByDept,
            location: input.address,
            judicialCaseId: judicialCaseId,
            organizationId: server.id,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${input.citizenId}`);
        return warrant;
      } catch (error) {
        logger.error("Erreur lors de la création du mandat:", error);
        throw new Error(`Impossible de créer le mandat: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
}

// Action pour mettre à jour un mandat
export async function updateWarrantAction(data: WarrantUpdateSchemaType) {
  return serverAction
    .schema(WarrantUpdateSchema)
    .metadata({ customPermissions: ["EDIT_WARRANT"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer le mandat pour vérifier s'il existe
      const existingWarrant = await prisma.warrant.findFirst({
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

      if (!existingWarrant) {
        throw new Error("Mandat introuvable");
      }

      try {
        // Mettre à jour le mandat
        const updatedWarrant = await prisma.warrant.update({
          where: {
            id: input.id,
          },
          data: {
            type: input.type,
            description: input.title,
            notes: input.reason,
            expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined,
            status: input.status,
            location: input.address,
            executedDate: input.executedDate ? new Date(input.executedDate) : undefined,
            executedByName: input.executedByName,
            executionNotes: input.executedDetails,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${existingWarrant.citizen.id}`);
        return updatedWarrant;
      } catch (error) {
        logger.error("Erreur lors de la mise à jour du mandat:", error);
        throw new Error(`Impossible de mettre à jour le mandat: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
}

// Action pour exécuter un mandat
export async function executeWarrantAction(data: ExecuteWarrantSchemaType) {
  return serverAction
    .schema(ExecuteWarrantSchema)
    .metadata({ customPermissions: ["EXECUTE_WARRANT"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      const user = await getRequiredUser();
      
      // Récupérer le mandat pour vérifier s'il existe
      const existingWarrant = await prisma.warrant.findFirst({
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

      if (!existingWarrant) {
        throw new Error("Mandat introuvable");
      }

      if (existingWarrant.status !== "ACTIVE") {
        throw new Error("Ce mandat ne peut pas être exécuté car il n'est pas actif");
      }

      try {
        // Mettre à jour le mandat avec les détails d'exécution
        const executedWarrant = await prisma.warrant.update({
          where: {
            id: input.id,
          },
          data: {
            status: "EXECUTED",
            executedDate: new Date(),
            executedById: user.id,
            executedByName: input.executedByName,
            executionNotes: input.executedDetails,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${existingWarrant.citizen.id}`);
        return executedWarrant;
      } catch (error) {
        logger.error("Erreur lors de l'exécution du mandat:", error);
        throw new Error(`Impossible d'exécuter le mandat: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
}

// Action pour supprimer un mandat
export async function deleteWarrantAction(data: DeleteWarrantSchemaType) {
  return serverAction
    .schema(DeleteWarrantSchema)
    .metadata({ customPermissions: ["DELETE_WARRANT"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer le mandat pour vérifier s'il existe
      const existingWarrant = await prisma.warrant.findFirst({
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

      if (!existingWarrant) {
        throw new Error("Mandat introuvable");
      }

      try {
        // Supprimer le mandat
        await prisma.warrant.delete({
          where: {
            id: input.id,
          },
        });

        revalidatePath(`/servers/${server.slug}/citizens/${existingWarrant.citizen.id}`);
        return { success: true };
      } catch (error) {
        logger.error("Erreur lors de la suppression du mandat:", error);
        throw new Error(`Impossible de supprimer le mandat: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
} 