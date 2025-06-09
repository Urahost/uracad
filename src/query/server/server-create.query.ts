import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const createServerQuery = async (
  params: Prisma.OrganizationUncheckedCreateInput,
) => {
  // const customer = await stripe.customers.create({
  //   email: params.email,
  //   name: params.name,
  // });

  const server = await prisma.organization.create({
    data: {
      ...params,
      // stripeCustomerId: customer.id,
    },
  });

  return server;
};
