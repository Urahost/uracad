"use server";

import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";

const UpdateMedicalRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["CARE", "INJURY", "TRAUMA", "PSYCHOLOGY", "DEATH"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isConfidential: z.boolean().default(false),
  isPoliceVisible: z.boolean().default(false),
  restrictedAccess: z.boolean().default(false),
});

export type UpdateMedicalRecordSchemaType = z.infer<typeof UpdateMedicalRecordSchema>;

export const updateMedicalRecordAction = serverAction
  .schema(UpdateMedicalRecordSchema)
  .action(async ({ parsedInput: input }) => {
    const server = await getRequiredCurrentServerCache();
    const record = await prisma.medicalRecord.findFirst({
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

    if (!record) {
      throw new Error("Medical record not found");
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: {
        id: input.id,
      },
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        isConfidential: input.isConfidential,
        isPoliceVisible: input.isPoliceVisible,
        restrictedAccess: input.restrictedAccess,
      },
    });

    revalidatePath(`/servers/${server.slug}/citizens/${record.citizen.id}`);
    revalidatePath(`/servers/${server.slug}/ems`);

    return updatedRecord;
  });

const DeleteMedicalRecordSchema = z.object({
  id: z.string(),
});

export const deleteMedicalRecordAction = serverAction
  .schema(DeleteMedicalRecordSchema)
  .action(async ({ parsedInput: input }) => {
    const server = await getRequiredCurrentServerCache();
    const record = await prisma.medicalRecord.findFirst({
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

    if (!record) {
      throw new Error("Medical record not found");
    }

    await prisma.medicalRecord.delete({
      where: {
        id: input.id,
      },
    });

    // Revalidate with the specific paths
    revalidatePath(`/servers/${server.slug}/citizens/${record.citizen.id}`);
    revalidatePath(`/servers/${server.slug}/ems`);

    return { success: true };
  }); 