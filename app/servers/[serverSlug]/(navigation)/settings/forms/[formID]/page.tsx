import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { prisma } from "@/lib/prisma";
import { FormBuilder } from "../FormBuilder";
import { Button } from "@/components/ui/button";
import { Settings2Icon, LinkIcon, MessageSquareIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout, LayoutHeader, LayoutTitle, LayoutActions, LayoutContent } from "@/features/page/layout";
import { CopyLinkButton } from "../components/copy-link-button";
import { getServerUrl } from "@/lib/server-url";

export default async function EditFormPage({ params }: { params: { formID: string } }) {
  const server = await getRequiredCurrentServerCache();
  const form = await prisma.form.findUnique({
    where: { id: params.formID },
    include: { 
      questions: true,
      _count: {
        select: { responses: true }
      }
    },
  });
  if (!form) return <div className="p-8 text-center">Formulaire introuvable</div>;

  const publicUrl = `${getServerUrl()}/servers/${server.slug}/public/forms/${form.id}`;

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Modifier le formulaire</LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            asChild
          >
            <CopyLinkButton url={publicUrl} />
          </Button>
          <Button type="button" variant="outline" title="Options (notifications, etc.)">
            <Settings2Icon className="w-4 h-4 mr-1" /> Options
          </Button>
        </div>
      </LayoutActions>
      <LayoutContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Lien public
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground break-all">{publicUrl}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquareIcon className="w-4 h-4" /> Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">{form._count.responses}</span> réponse{form._count.responses > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">{form.questions.length}</span> question{form.questions.length > 1 ? 's' : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <FormBuilder
            organizationId={server.id}
            serverSlug={server.slug}
            initialForm={form}
          />
        </div>
      </LayoutContent>
    </Layout>
  );
}
