import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { FormBuilder } from "../FormBuilder";

export default async function NewFormPage() {
  const server = await getRequiredCurrentServerCache();
  return <FormBuilder organizationId={server.id} serverSlug={server.slug} />;
}
