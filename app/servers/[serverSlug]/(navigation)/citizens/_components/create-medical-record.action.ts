"use server";

import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";

const Schema = z.object({
  type: z.enum(["CARE", "INJURY", "TRAUMA", "PSYCHOLOGY", "DEATH"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isConfidential: z.boolean().default(false),
  isPoliceVisible: z.boolean().default(false),
  restrictedAccess: z.boolean().default(false),
  citizenId: z.string(),
});

export type CreateMedicalRecordSchema = z.infer<typeof Schema>;

export const createMedicalRecordAction = serverAction
  .schema(Schema)
  .action(async ({ parsedInput: input }) => {
    const server = await getRequiredCurrentServerCache();
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        isConfidential: input.isConfidential,
        isPoliceVisible: input.isPoliceVisible,
        restrictedAccess: input.restrictedAccess,
        citizenId: input.citizenId,
        organizationId: server.id,
      },
    });

    return medicalRecord;
  });
