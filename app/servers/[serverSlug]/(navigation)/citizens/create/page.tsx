import { 
  Layout, 
  LayoutContent, 
  LayoutDescription, 
  LayoutHeader, 
  LayoutTitle,
} from "@/features/page/layout";
import { CitizenForm } from "../_components/citizen-form";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";

export default async function CreateCitizenPage() {
  const server = await getRequiredCurrentServerCache();

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Create Citizen</LayoutTitle>
        <LayoutDescription>
          Add a new citizen to the database
        </LayoutDescription>
      </LayoutHeader>
      <LayoutContent className="px-0">
        <CitizenForm serverSlug={server.slug} />
      </LayoutContent>
    </Layout>
  );
} 