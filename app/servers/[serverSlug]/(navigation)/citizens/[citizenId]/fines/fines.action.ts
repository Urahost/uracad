"use server";

import { serverAction } from "@/lib/actions/safe-actions";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { FineCreateSchema, FineUpdateSchema, FinePaymentSchema } from "./fines.schema";
import { z } from "zod";
import type { FineCreateSchemaType, FineUpdateSchemaType, FinePaymentSchemaType } from "./fines.schema";
import { logger } from "@/lib/logger";

// Action pour créer une amende
export async function createFineAction(data: FineCreateSchemaType) {
  return serverAction
    .schema(FineCreateSchema)
    .metadata({ customPermissions: ["CREATE_FINE"] })
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
        throw new Error("Citizen not found");
      }

      try {
        // Vérifier si penalCodeId est fourni et existe
        let dataToCreate = { ...input, organizationId: server.id, issuedById: user.id };
        
        // Si penalCodeId est fourni, vérifier qu'il existe
        if (input.penalCodeId) {
          const penalCode = await prisma.penalCode.findUnique({
            where: { id: input.penalCodeId }
          });
          
          // Si le code pénal n'existe pas, supprimer penalCodeId
          if (!penalCode) {
            logger.warn(`Le code pénal avec l'ID ${input.penalCodeId} n'existe pas. Il sera ignoré.`);
            const { penalCodeId, ...rest } = dataToCreate;
            dataToCreate = rest;
          }
        } else {
          // Si penalCodeId est undefined ou null, s'assurer qu'il n'est pas inclus dans les données
          const { penalCodeId, ...rest } = dataToCreate;
          dataToCreate = rest;
        }
        
        // Créer l'amende avec les données validées
        const fine = await prisma.fine.create({
          data: dataToCreate
        });

        // Puis mettre à jour les points de permis uniquement si l'amende est créée avec succès
        if (input.licensePoints && input.licensePoints > 0) {
          await prisma.citizen.update({
            where: { id: citizen.id },
            data: {
              driversLicensePoints: {
                decrement: input.licensePoints,
              },
            },
          });
        }

        return fine;
      } catch (error) {
        logger.error("Erreur lors de la création de l'amende:", error);
        throw new Error(`Impossible de créer l'amende: ${error instanceof Error ? error.message : String(error)}`);
      }
    })(data);
}

// Action pour mettre à jour une amende
export async function updateFineAction(data: FineUpdateSchemaType) {
  return serverAction
    .schema(FineUpdateSchema)
    .metadata({ customPermissions: ["EDIT_FINE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer l'amende pour vérifier si elle existe
      const existingFine = await prisma.fine.findFirst({
        where: {
          id: input.id,
          organizationId: server.id,
        },
        include: {
          citizen: true,
        },
      });

      if (!existingFine) {
        throw new Error("Fine not found");
      }

      // Si les points de permis sont modifiés, ajuster les points du citoyen
      if (input.licensePoints !== undefined && 
          existingFine.licensePoints !== input.licensePoints) {
        const pointDifference = (existingFine.licensePoints ?? 0) - input.licensePoints;
        
        await prisma.citizen.update({
          where: { id: existingFine.citizenId },
          data: {
            driversLicensePoints: {
              increment: pointDifference,
            },
          },
        });
      }

      // Mettre à jour l'amende
      const updatedFine = await prisma.fine.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
          // Si le statut passe à PAID, mettre à jour paidAt
          paidAt: input.status === "PAID" ? new Date() : undefined,
        },
      });

      return updatedFine;
    })(data);
}

// Action pour supprimer une amende
export async function deleteFineAction(data: { id: string }) {
  return serverAction
    .schema(z.object({ id: z.string() }))
    .metadata({ customPermissions: ["DELETE_FINE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer l'amende pour vérifier si elle existe
      const existingFine = await prisma.fine.findFirst({
        where: {
          id: input.id,
          organizationId: server.id,
        },
        include: {
          citizen: true,
        },
      });

      if (!existingFine) {
        throw new Error("Fine not found");
      }

      // Si l'amende a retiré des points de permis, les restituer
      if (existingFine.licensePoints && existingFine.licensePoints > 0) {
        await prisma.citizen.update({
          where: { id: existingFine.citizenId },
          data: {
            driversLicensePoints: {
              increment: existingFine.licensePoints,
            },
          },
        });
      }

      // Supprimer l'amende
      await prisma.fine.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    })(data);
}

// Action pour traiter le paiement d'une amende
export async function processFinePaymentAction(data: FinePaymentSchemaType) {
  return serverAction
    .schema(FinePaymentSchema)
    .metadata({ customPermissions: ["EDIT_FINE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer l'amende pour vérifier si elle existe
      const existingFine = await prisma.fine.findFirst({
        where: {
          id: input.id,
          organizationId: server.id,
        },
        include: {
          citizen: true,
        },
      });

      if (!existingFine) {
        throw new Error("Fine not found");
      }

      // Mettre à jour l'amende
      const updatedFine = await prisma.fine.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
          paidAt: input.status === "PAID" ? new Date() : null,
        },
      });

      return updatedFine;
    })(data);
} 