import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { ServerDetailsForm } from "./(details)/server-details-form";
import { prisma } from "@/lib/prisma";

export default async function RoutePage(props: PageParams) {
  const { id: serverId } = await getRequiredCurrentServerCache({
    permissions: {
      organization: ["update"],
    },
  });

  const server = await prisma.organization.findUnique({
    where: {
      id: serverId,
    }
  });

  if (!server) {
    notFound();
  }

  const parsedMetadata = server.metadata ? JSON.parse(server.metadata) : null;
  const currentTheme = parsedMetadata?.colorsTheme ?? "Default";

  return <ServerDetailsForm defaultValues={server} organizationId={serverId} currentTheme={currentTheme} organization={server} />;
}
