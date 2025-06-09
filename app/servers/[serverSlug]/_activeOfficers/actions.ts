"use server";

import { getSession } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ActionError, serverAction } from "@/lib/actions/safe-actions";
import { officerSchema } from "./schema";

// Get all organization members
export const getOrganizationMembers = serverAction.schema(
  z.object({
    organizationId: z.string(),
  })
).action(async ({ parsedInput: { organizationId } }): Promise<{
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
}[]> => {
  // Get all members of the organization
  const members = await prisma.member.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        }
      }
    },
    orderBy: {
      user: {
        name: 'asc'
      }
    }
  });

  // Transform the data
  return members.map(member => ({
    id: member.id,
    userId: member.userId,
    name: member.user.name || 'Unnamed',
    email: member.user.email || '',
    image: member.user.image,
  }));
});

// Get all active officers
export const getActiveOfficers = serverAction.schema(
  z.object({
    organizationId: z.string(),
  })
).action(async ({ parsedInput: { organizationId } }) => {
  const officers = await prisma.activeOfficer.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return officers;
});

// Create a new active officer
export const createActiveOfficer = serverAction.schema(
  z.object({
    organizationId: z.string(),
    data: officerSchema,
  })
).action(async ({ parsedInput: { organizationId, data } }) => {
  const session = await getSession();
  const userId = session?.user.id;

  if (!userId) {
    throw new ActionError("Authentication required");
  }

  const officer = await prisma.activeOfficer.create({
    data: {
      ...data,
      organizationId,
      createdById: userId,
    },
  });

  return officer;
});

// Create a temporary unit 
export const createTemporaryUnit = serverAction.schema(
  z.object({
    organizationId: z.string(),
    data: officerSchema,
  })
).action(async ({ parsedInput: { organizationId, data } }) => {
  const session = await getSession();
  const userId = session?.user.id;

  if (!userId) {
    throw new ActionError("Authentication required");
  }

  const officer = await prisma.activeOfficer.create({
    data: {
      ...data,
      isTemporary: true,
      organizationId,
      createdById: userId,
    },
  });

  return officer;
});

// Update an existing officer
export const updateActiveOfficer = serverAction.schema(
  z.object({
    id: z.string(),
    organizationId: z.string(),
    data: officerSchema.partial(),
  })
).action(async ({ parsedInput: { id, organizationId, data } }) => {
  const officer = await prisma.activeOfficer.update({
    where: {
      id,
      organizationId,
    },
    data,
  });

  return officer;
});

// Delete an officer
export const deleteActiveOfficer = serverAction.schema(
  z.object({
    id: z.string(),
    organizationId: z.string(),
  })
).action(async ({ parsedInput: { id, organizationId } }) => {
  await prisma.activeOfficer.delete({
    where: {
      id,
      organizationId,
    },
  });

  return { success: true };
}); 