"use server";

import { serverAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { z } from "zod";
import { CitizenSchema } from "./citizens.schema";

// Get all citizens for the current organization
export async function getCitizensList(page = 1, limit = 10) {
  const org = await getRequiredCurrentServerCache();
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Get paginated citizens
  const citizens = await prisma.citizen.findMany({
    where: {
      organizationId: org.id
    },
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take: limit
  });
  
  // Get total count for pagination
  const totalCount = await prisma.citizen.count({
    where: {
      organizationId: org.id
    }
  });
  
  return {
    citizens,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}

// Get a single citizen by ID
export async function getCitizen(id: string) {
  const org = await getRequiredCurrentServerCache();
  
  const citizen = await prisma.citizen.findFirst({
    where: {
      id,
      organizationId: org.id
    }
  });
  
  return citizen; 
}

// Create citizen action
export async function createCitizen(data: z.infer<typeof CitizenSchema>) {
  const actionImpl = serverAction
    .schema(CitizenSchema)
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      const citizen = await prisma.citizen.create({
        data: {
          ...input,
          organizationId: server.id,
        },
      });

      return citizen;
    });
  
  return actionImpl(data);
}

// Update citizen action
export async function updateCitizen(data: z.infer<typeof CitizenSchema> & { id: string }) {
  const updateSchema = CitizenSchema.extend({
    id: z.string({ required_error: "Citizen ID is required" }),
  });
  
  const actionImpl = serverAction
    .schema(updateSchema)
    .action(async ({ parsedInput: input }) => {
      const { id, ...data } = input;
      const server = await getRequiredCurrentServerCache();
      
      // Ensure citizen belongs to organization
      const existingCitizen = await prisma.citizen.findFirst({
        where: {
          id,
          organizationId: server.id
        }
      });
      
      if (!existingCitizen) {
        throw new Error("Citizen not found");
      }
      
      const citizen = await prisma.citizen.update({
        where: { id },
        data
      });

      return citizen;
    });
  
  return actionImpl(data);
}

// Delete citizen action
export async function deleteCitizen(data: { id: string }) {
  const deleteSchema = z.object({
    id: z.string({ required_error: "Citizen ID is required" }),
  });
  
  const actionImpl = serverAction
    .schema(deleteSchema)
    .action(async ({ parsedInput: input }) => {
      const { id } = input;
      const server = await getRequiredCurrentServerCache();
      
      // Ensure citizen belongs to organization
      const existingCitizen = await prisma.citizen.findFirst({
        where: {
          id,
          organizationId: server.id
        }
      });
      
      if (!existingCitizen) {
        throw new Error("Citizen not found");
      }
      
      await prisma.citizen.delete({
        where: { id }
      });

      return { success: true };
    });
  
  return actionImpl(data);
} 