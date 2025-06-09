import { Layout, LayoutActions, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { listForms } from "./form-actions";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { FormsTableClient } from "./components/forms-table-client";
import { Button } from "@/components/ui/button";

export default async function FormsAdminPage() {
  const server = await getRequiredCurrentServerCache();
  const forms = await listForms(server.id);

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Formulaires</LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        <Link href={`/servers/${server.slug}/settings/forms/new`}>
        <Button>
          <PlusIcon className="w-4 h-4" />
          Nouveau formulaire
        </Button>
        </Link>
      </LayoutActions>
      <LayoutContent>
        <FormsTableClient forms={forms} server={server} />
      </LayoutContent>
    </Layout>
  );
}
