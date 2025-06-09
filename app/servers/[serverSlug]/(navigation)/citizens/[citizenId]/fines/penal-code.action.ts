"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import type { Prisma } from "@prisma/client";
import { PenalCodeCreateSchema, PenalCodeUpdateSchema } from "./penal-code.schema";
import type { PenalCodeCreateSchemaType, PenalCodeUpdateSchemaType } from "./penal-code.schema"; 

// Action pour créer une infraction du code pénal
export async function createPenalCodeAction(data: PenalCodeCreateSchemaType) {
  return serverAction
    .schema(PenalCodeCreateSchema)
    .metadata({ customPermissions: ["MANAGE_PENAL_CODE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();

      // Vérifier si le code existe déjà
      const existingPenalCode = await prisma.penalCode.findFirst({
        where: {
          code: input.code,
          organizationId: server.id,
        },
      });

      if (existingPenalCode) {
        throw new Error("Penal code with this code already exists");
      }

      // Créer l'infraction du code pénal
      const penalCode = await prisma.penalCode.create({
        data: {
          ...input,
          organizationId: server.id,
        },
      });

      return penalCode;
    })(data);
}

// Action pour mettre à jour une infraction du code pénal
export async function updatePenalCodeAction(data: PenalCodeUpdateSchemaType) {
  return serverAction
    .schema(PenalCodeUpdateSchema)
    .metadata({ customPermissions: ["MANAGE_PENAL_CODE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer l'infraction pour vérifier si elle existe
      const existingPenalCode = await prisma.penalCode.findFirst({
        where: {
          id: input.id,
          organizationId: server.id,
        },
      });

      if (!existingPenalCode) {
        throw new Error("Penal code not found");
      }

      // Si le code est modifié, vérifier qu'il n'existe pas déjà
      if (input.code && input.code !== existingPenalCode.code) {
        const duplicateCode = await prisma.penalCode.findFirst({
          where: {
            code: input.code,
            organizationId: server.id,
            id: { not: input.id },
          },
        });

        if (duplicateCode) {
          throw new Error("Penal code with this code already exists");
        }
      }

      // Mettre à jour l'infraction
      const updatedPenalCode = await prisma.penalCode.update({
        where: {
          id: input.id,
        },
        data: input,
      });

      return updatedPenalCode;
    })(data);
}

// Action pour supprimer une infraction du code pénal
export async function deletePenalCodeAction(data: { id: string }) {
  return serverAction
    .schema(z.object({ id: z.string() }))
    .metadata({ customPermissions: ["MANAGE_PENAL_CODE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer l'infraction pour vérifier si elle existe
      const existingPenalCode = await prisma.penalCode.findFirst({
        where: {
          id: input.id,
          organizationId: server.id,
        },
      });

      if (!existingPenalCode) {
        throw new Error("Penal code not found");
      }

      // Vérifier si des amendes utilisent cette infraction
      const relatedFines = await prisma.fine.count({
        where: {
          penalCodeId: input.id,
        },
      });

      if (relatedFines > 0) {
        throw new Error("Cannot delete: this penal code is used in existing fines");
      }

      // Supprimer l'infraction
      await prisma.penalCode.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    })(data);
}

// Action pour récupérer toutes les infractions du code pénal
export async function getPenalCodesAction(data: { category?: string, search?: string }) {
  return serverAction
    .schema(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
    }))
    .metadata({ customPermissions: ["VIEW_FINE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Construire la requête
      const where: Prisma.PenalCodeWhereInput = {
        organizationId: server.id,
      };

      // Filtre par catégorie si spécifié
      if (input.category) {
        where.category = input.category;
      }

      // Recherche par code ou description si spécifiée
      if (input.search) {
        where.OR = [
          { code: { contains: input.search, mode: 'insensitive' as const } },
          { description: { contains: input.search, mode: 'insensitive' as const } },
        ];
      }

      // Récupérer les infractions
      const penalCodes = await prisma.penalCode.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { code: 'asc' },
        ],
      });

      // Récupérer les catégories distinctes
      const categories = await prisma.penalCode.findMany({
        where: {
          organizationId: server.id,
        },
        select: {
          category: true,
        },
        distinct: ['category'],
        orderBy: {
          category: 'asc',
        },
      });

      return {
        penalCodes,
        categories: categories.map(c => c.category),
      };
    })(data);
} 