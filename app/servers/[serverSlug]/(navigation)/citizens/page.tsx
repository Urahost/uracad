import type { PageParams } from "@/types/next";
import { 
  Layout, 
  LayoutContent, 
  LayoutDescription, 
  LayoutHeader, 
  LayoutTitle,
  LayoutActions
} from "@/features/page/layout";
import { getCitizensList } from "./_actions/citizens.action";
import { CitizensTable } from "./_components/citizens-table";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { createSearchParamsCache, parseAsInteger } from "nuqs/server";
import { combineWithParentMetadata } from "@/lib/metadata";
import { CreateCitizenModal } from "./_components/create-citizen-modal";
import { PermissionsProvider } from "../permissions/permissions-provider";

// Ajouter des métadonnées à la page
export const generateMetadata = combineWithParentMetadata({
  title: "Citizens",
  description: "Manage citizens database for your CAD/MDT system",
});

// Create searchParams cache for pagination
const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10)
});

export default async function CitizensPage({ searchParams }: PageParams) {
  // Parse search params
  const { page, limit } = await searchParamsCache.parse(searchParams);
  const server = await getRequiredCurrentServerCache();
  
  // Get citizens with pagination
  const { citizens, pagination } = await getCitizensList(page, limit);

  // Log debug
  console.log("CITIZENS DEBUG", citizens, "SERVER", server);

  return (
    <PermissionsProvider requiredPermissions={["CREATE_CITIZEN", "DELETE_CITIZEN", "EDIT_CITIZEN", "VIEW_CITIZEN"]}>
      <Layout size="lg">
        <LayoutHeader>
          <LayoutTitle>Citizens</LayoutTitle>
          <LayoutDescription>
            Manage citizens database for your CAD/MDT system
          </LayoutDescription>
        </LayoutHeader>
        <LayoutActions>
            <CreateCitizenModal serverSlug={server.slug} />
        </LayoutActions>
        <LayoutContent>
          <CitizensTable 
            citizens={citizens} 
            serverSlug={server.slug} 
            pagination={pagination}
          />
        </LayoutContent>
      </Layout>
    </PermissionsProvider>
  );
}
