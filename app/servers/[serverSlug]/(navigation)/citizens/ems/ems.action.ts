"use server";

import { serverAction } from "@/lib/actions/safe-actions";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { logger } from "@/lib/logger";

const SearchSchema = z.string().min(2);

export async function searchCitizens(query: string) {
  const server = await getRequiredCurrentServerCache();
  
  if (!query || query.length < 2) {
    return [];
  }

  const citizens = await prisma.citizen.findMany({
    where: {
      organizationId: server.id,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { surname: { contains: query, mode: "insensitive" } },
        { socialSecurityNumber: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      surname: true,
      socialSecurityNumber: true,
      dateOfBirth: true,
      image: true,
      gender: true,
      address: true,
      phone: true,
      medicalRecords: {
        select: {
          id: true,
          type: true,
          title: true,
          isConfidential: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
    },
    orderBy: [
      { surname: "asc" },
      { name: "asc" },
    ],
    take: 10,
  });

  return citizens;
}

export const searchCommandResults = serverAction
  .schema(SearchSchema)
  .action(async ({ parsedInput: query, ctx }) => {
    logger.info("Searching with query:", { query, serverId: ctx.id });
    
    const searchTerms = query.split(" ").filter(Boolean);
    
    // Rechercher les citoyens
    const citizens = await prisma.citizen.findMany({
      where: {
        organizationId: ctx.id,
        OR: searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" as Prisma.QueryMode } },
            { surname: { contains: term, mode: "insensitive" as Prisma.QueryMode } },
            { socialSecurityNumber: { contains: term, mode: "insensitive" as Prisma.QueryMode } },
          ],
        })),
      },
      select: {
        id: true,
        name: true,
        surname: true,
        socialSecurityNumber: true,
      },
    });

    logger.info("Found citizens:", { count: citizens.length });

    // Rechercher les dossiers médicaux
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        citizen: {
          organizationId: ctx.id,
        },
        OR: [
          { title: { contains: query, mode: "insensitive" as Prisma.QueryMode } },
          { description: { contains: query, mode: "insensitive" as Prisma.QueryMode } },
          {
            citizen: {
              OR: [
                { name: { contains: query, mode: "insensitive" as Prisma.QueryMode } },
                { surname: { contains: query, mode: "insensitive" as Prisma.QueryMode } },
                { socialSecurityNumber: { contains: query, mode: "insensitive" as Prisma.QueryMode } },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        isConfidential: true,
        citizen: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    logger.info("Found medical records:", { count: medicalRecords.length });

    return {
      citizens,
      medicalRecords,
    };
  }); 