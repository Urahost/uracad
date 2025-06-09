import type { PageParams } from "@/types/next";
import { 
  Layout, 
  LayoutContent, 
  LayoutDescription, 
  LayoutHeader, 
  LayoutTitle,
} from "@/features/page/layout";
import { CitizenForm } from "../../citizen-form";
import { getCitizen } from "../../citizens.action";
import { notFound } from "next/navigation";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { PermissionCheck } from "../../../permissions/permission-check";

export default async function EditCitizenPage(props: PageParams<{ citizenId: string }>) {
  const server = await getRequiredCurrentServerCache();
  const params = await props.params;
  const citizen = await getCitizen(params.citizenId);
  
  if (!citizen) {
    notFound();
  }

  return (
    <PermissionCheck
      permission="EDIT_CITIZENS"
      fallback={`/servers/${server.slug}/citizens/${citizen.id}`}
    >
      <Layout size="lg">
        <LayoutHeader>
          <LayoutTitle>Edit Citizen</LayoutTitle>
          <LayoutDescription>
            Update citizen information
          </LayoutDescription>
        </LayoutHeader>
        <LayoutContent className="px-0">
          <CitizenForm citizen={citizen} serverSlug={server.slug} />
        </LayoutContent>
      </Layout>
    </PermissionCheck>
  );
} 