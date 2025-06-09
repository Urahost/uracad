import { getUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { NextResponse } from "next/server";

/**
 * If a user arrive to `/servers` we redirect them to the first server they are part of.
 *
 * 💡 If you want to redirect user to server page, redirect them to `/servers`
 * 💡 If you want them to redirect to a specific server, redirect them to `/servers/serverSlug`
 */
export const GET = async () => {
  const user = await getUser();

  if (!user) {
    return NextResponse.redirect(`${getServerUrl()}/auth/signin`);
  }

  const server = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!server) {
    return NextResponse.redirect(`${getServerUrl()}/servers/new`);
  }

  return NextResponse.redirect(`${getServerUrl()}/servers/${server.slug}`);
};
