import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const getServersMembers = async (serverId: string) => {
  return prisma.member.findMany({
    where: {
      organizationId: serverId,
    },
    select: {
      user: {
        select: {
          image: true,
          id: true,
          name: true,
          email: true,
        },
      },
      id: true,
      role: true,
      userId: true,
    },
  });
};

export type ServerMembers = Prisma.PromiseReturnType<typeof getServersMembers>;
