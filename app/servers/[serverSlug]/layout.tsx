import { RefreshPage } from "@/components/utils/refresh-page";
import { auth } from "@/lib/auth";
import { serverMetadata } from "@/lib/metadata";
import { getCurrentServer } from "@/lib/servers/get-server";
import type { LayoutParams, PageParams } from "@/types/next";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { InjectCurrentServerStore } from "./use-current-server";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(
  props: PageParams<{ serverSlug: string }>,
): Promise<Metadata> {
  const params = await props.params;
  return serverMetadata(params.serverSlug);
}

export default async function RouteLayout(
  props: LayoutParams<{ serverSlug: string }>,
) {
  const params = await props.params;
  const headersList = await headers();
  const pathname = headersList.get("x-current-path") ?? "";

  // Check if this is a public route first to avoid any auth checks
  if (pathname.includes("/public/")) {
    // Just verify that the server exists
    const serverExists = await prisma.organization.findUnique({
      where: { slug: params.serverSlug },
      select: { id: true },
    });
    
    if (!serverExists) {
      throw new Error("Server not found");
    }
    
    return <>{props.children}</>;
  }

  try {
    const server = await getCurrentServer();

    // The user try to go to another server, we must sync with the URL
    if (server?.slug !== params.serverSlug) {
      // Note: Still using setActiveOrganization API method since the API hasn't been renamed
      await auth.api.setActiveOrganization({
        headers: headersList,
        body: {
          organizationSlug: params.serverSlug,
        },
      });
      // Make a full refresh of the page
      return <RefreshPage />;
    }

    return (
      <InjectCurrentServerStore
        server={{
          id: server.id,
          slug: server.slug,
          name: server.name,
          image: server.logo ?? null,
        }}
      >
        {props.children}
      </InjectCurrentServerStore>
    );
  } catch (error) {
    logger.error("Layout error:", error);
    throw error;
  }
}
