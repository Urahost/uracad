"use server";

import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";


const CreateVehicleSchema = z.object({
  citizenId: z.string(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().optional(),
  licensePlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  additionalInfo: z.string().optional(),
  color: z.string().default("UNKNOWN"),
  type: z.string().default("CAR"),
});

export type CreateVehicleSchemaType = z.infer<typeof CreateVehicleSchema>;

export const createVehicleAction = serverAction
  .schema(CreateVehicleSchema)
  .action(async ({ parsedInput: input }) => {
    const server = await getRequiredCurrentServerCache();
  
    // Vérifier que le citoyen existe et appartient à cette organisation
    const citizen = await prisma.citizen.findFirst({
      where: {
        id: input.citizenId,
        organizationId: server.id,
      },
    });

    if (!citizen) {
      throw new Error("Citizen not found");
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        make: input.make,
        model: input.model,
        year: input.year,
        licensePlate: input.licensePlate,
        vin: input.vin,
        additionalInfo: input.additionalInfo,
        citizenId: input.citizenId,
        organizationId: server.id,
        color: input.color,
        type: input.type,
      },
    });

    revalidatePath(`/servers/${server.slug}/citizens/${input.citizenId}`);

    return vehicle;
  });

const UpdateVehicleSchema = z.object({
  id: z.string(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().optional(),
  licensePlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  additionalInfo: z.string().optional(),
  color: z.string().default("UNKNOWN"),
  type: z.string().default("CAR"),
});

export type UpdateVehicleSchemaType = z.infer<typeof UpdateVehicleSchema>;

export const updateVehicleAction = serverAction
  .schema(UpdateVehicleSchema)
  .action(async ({ parsedInput: input }) => {
    const server = await getRequiredCurrentServerCache();
    
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: input.id,
        citizen: {
          organizationId: server.id,
        },
      },
      include: {
        citizen: true,
      },
    });

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: {
        id: input.id,
      },
      data: {
        make: input.make,
        model: input.model,
        year: input.year,
        licensePlate: input.licensePlate,
        vin: input.vin,
        additionalInfo: input.additionalInfo,
        color: input.color,
        type: input.type,
      },
    });

    revalidatePath(`/servers/${server.slug}/citizens/${vehicle.citizen.id}`);

    return updatedVehicle;
  });

const DeleteVehicleSchema = z.object({
  id: z.string(),
});

export const deleteVehicleAction = serverAction
  .schema(DeleteVehicleSchema)
  .action(async ({ parsedInput: input }) => {
    const server = await getRequiredCurrentServerCache();
    
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: input.id,
        citizen: {
          organizationId: server.id,
        },
      },
      include: {
        citizen: true,
      },
    });

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    await prisma.vehicle.delete({
      where: {
        id: input.id,
      },
    });

    revalidatePath(`/servers/${server.slug}/citizens/${vehicle.citizen.id}`);

    return { success: true };
  });

export type VehicleListItem = {
  id: string;
  make: string;
  model: string;
  year: number | null;
  licensePlate: string;
  vin: string | null;
  additionalInfo: string | null;
  citizenId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getVehiclesByCitizenAction(data: { citizenId: string }): Promise<VehicleListItem[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      citizenId: data.citizenId,
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      licensePlate: true,
      vin: true,
      additionalInfo: true,
      citizenId: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return vehicles;
} 