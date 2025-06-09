import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/auth-user";
import { ActionError } from "@/lib/actions/safe-actions";

export async function getOrg(slug: string) {
  const session = await getSession();
  if (!session?.user.id) {
    throw new ActionError("Authentication required");
  }

  const organization = await prisma.organization.findFirst({
    where: {
      slug,
    },
    include: {
      members: {
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  if (!organization) {
    throw new ActionError("Organization not found");
  }

  const member = organization.members[0];

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    createdAt: organization.createdAt,
    logo: organization.logo,
    metadata: organization.metadata,
    email: organization.email,
    member: {
      id: member.id,
      role: member.role,
    },
  };
}
