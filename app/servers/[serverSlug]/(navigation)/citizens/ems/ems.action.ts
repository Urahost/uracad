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
        { lastName: { contains: query, mode: "insensitive" } },
        { charinfo: { path: ["socialSecurityNumber"], string_contains: query } },
      ],
    },
    select: {
      id: true,
      name: true,
      lastName: true,
      dateOfBirth: true,
      image: true,
      charinfo: true,
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
      { lastName: "asc" },
      { name: "asc" },
    ],
    take: 10,
  });

  return citizens.map(citizen => ({
    ...citizen,
    charinfo: typeof citizen.charinfo === 'string' ? JSON.parse(citizen.charinfo) : citizen.charinfo,
  }));
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
            { lastName: { contains: term, mode: "insensitive" as Prisma.QueryMode } },
            { charinfo: { path: ["socialSecurityNumber"], string_contains: term } },
          ],
        })),
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        charinfo: true,
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
                { lastName: { contains: query, mode: "insensitive" as Prisma.QueryMode } },
                { charinfo: { path: ["socialSecurityNumber"], string_contains: query } },
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
            lastName: true,
          },
        },
      },
    });

    logger.info("Found medical records:", { count: medicalRecords.length });

    return {
      citizens: citizens.map(citizen => ({
        ...citizen,
        charinfo: typeof citizen.charinfo === 'string' ? JSON.parse(citizen.charinfo) : citizen.charinfo,
      })),
      medicalRecords,
    };
  }); 