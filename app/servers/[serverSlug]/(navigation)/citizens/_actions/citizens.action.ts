"use server";

import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { CitizenSchema } from "../citizens.schema";
import { getServerSession } from "@/lib/auth/auth-user";

const DeleteCitizenSchema = z.object({
  id: z.string(),
});

export const deleteCitizenAction = serverAction
  .schema(DeleteCitizenSchema)
  .action(async ({ parsedInput: input }) => {
    const session = await getServerSession();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const citizen = await prisma.citizen.findUnique({
      where: { id: input.id },
      select: { organizationId: true },
    });

    if (!citizen) {
      throw new Error("Citizen not found");
    }

    await prisma.citizen.delete({
      where: { id: input.id },
    });
  });

export const createCitizenAction = serverAction
  .schema(CitizenSchema)
  .action(async ({ parsedInput: input }) => {
    const server = await getRequiredCurrentServerCache();
    const citizen = await prisma.citizen.create({
      data: {
        ...input,
        organizationId: server.id,
        citizenId: input.id ?? crypto.randomUUID(),
        money: input.money ?? {},
        charinfo: input.charinfo ?? {},
        job: input.job ?? {},
        gang: input.gang ?? {},
        position: input.position ?? {},
        metadata: input.metadata ?? {},
        inventory: input.inventory ?? {},
      },
    });

    return citizen;
  });

export const updateCitizenAction = serverAction
  .schema(CitizenSchema.extend({
    id: z.string(),
  }))
  .action(async ({ parsedInput: input }) => {
    const { id, ...data } = input;
    const server = await getRequiredCurrentServerCache();
    
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

export const getCitizensList = async (page: number, limit: number) => {
  const server = await getRequiredCurrentServerCache();
  
  const [citizens, total] = await Promise.all([
    prisma.citizen.findMany({
      where: { organizationId: server.id },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.citizen.count({
      where: { organizationId: server.id },
    }),
  ]);

  return {
    citizens,
    pagination: {
      page,
      limit,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCitizen = async (citizenId: string) => {
  const server = await getRequiredCurrentServerCache();
  return prisma.citizen.findFirst({
    where: {
      id: citizenId,
      organizationId: server.id,
    },
  });
}; 