import { prisma } from "@/lib/prisma";

export async function getServerBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });
} 