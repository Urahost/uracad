"use server";

import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";


const CreateVehicleSchema = z.object({
  citizenId: z.string(),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().optional(),
  plate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  type: z.string().min(1, "Type is required"),
  class: z.string().optional(),
  status: z.enum(["ACTIVE", "STOLEN", "IMPOUNDED", "DESTROYED"]).default("ACTIVE"),
  registrationStatus: z.enum(["REGISTERED", "EXPIRED", "SUSPENDED"]).default("REGISTERED"),
  insuranceStatus: z.string().optional(),
  registrationExpiryDate: z.date().optional(),
  lastInspectionDate: z.date().optional(),
  modifications: z.string().optional(),
  additionalInfo: z.string().optional(),
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
        brand: input.brand,
        model: input.model,
        plate: input.plate,
        vin: input.vin,
        color: input.color ? { primary: input.color } : undefined,
        type: input.type,
        class: input.class,
        state: input.status.toLowerCase(),
        citizenId: input.citizenId,
        organizationId: server.id,
      },
    });

    revalidatePath(`/servers/${server.slug}/citizens/${input.citizenId}`);

    return vehicle;
  });

const UpdateVehicleSchema = z.object({
  id: z.string(),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().optional(),
  plate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  type: z.string().min(1, "Type is required"),
  class: z.string().optional(),
  status: z.enum(["ACTIVE", "STOLEN", "IMPOUNDED", "DESTROYED"]).default("ACTIVE"),
  registrationStatus: z.enum(["REGISTERED", "EXPIRED", "SUSPENDED"]).default("REGISTERED"),
  insuranceStatus: z.string().optional(),
  registrationExpiryDate: z.date().optional(),
  lastInspectionDate: z.date().optional(),
  modifications: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export type UpdateVehicleSchemaType = z.infer<typeof UpdateVehicleSchema>;

export const updateVehicleAction = serverAction
  .schema(UpdateVehicleSchema)
  .action(async ({ parsedInput: input })     => {
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
        brand: input.brand,
        model: input.model,
        plate: input.plate,
        vin: input.vin,
        color: input.color ? { primary: input.color } : undefined,
        type: input.type,
        class: input.class,
        state: input.status.toLowerCase(),
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

// Action pour récupérer les véhicules d'un citoyen
export async function getVehiclesByCitizenAction(data: { citizenId: string }) {
  return serverAction
    .schema(z.object({ citizenId: z.string() }))
    .metadata({ customPermissions: ["VIEW_VEHICLE"] })
    .action(async ({ parsedInput: input }) => {
      const server = await getRequiredCurrentServerCache();
      
      // Récupérer les véhicules du citoyen
      const vehicles = await prisma.vehicle.findMany({
        where: {
          citizenId: input.citizenId,
          citizen: {
            organizationId: server.id,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          brand: true,
          model: true,
          plate: true,
          vin: true,
          color: true,
          type: true,
          state: true,
        },
      });

      return vehicles;
    })(data);
} 