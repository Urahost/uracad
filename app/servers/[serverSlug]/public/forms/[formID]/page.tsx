import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Layout, LayoutHeader, LayoutTitle, LayoutContent } from "@/features/page/layout";
import { getServerBySlug } from "@/lib/db/server-db";
import { FormSubmit } from "./components/form-submit";
import { Toaster } from "sonner";

export default async function PublicFormPage({ 
  params 
}: { 
  params: { serverSlug: string; formID: string } 
}) {
  const { serverSlug, formID } = await params;
  
  // Vérifier que le serveur existe
  const server = await getServerBySlug(serverSlug);
  if (!server) return notFound();

  // Récupérer le formulaire
  const form = await prisma.form.findUnique({
    where: { 
      id: formID,
      organizationId: server.id
    },
    include: { 
      questions: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!form) return notFound();

  return (
    <>
      <Toaster />
      <Layout size="sm">
        <LayoutHeader>
          <LayoutTitle>{form.title}</LayoutTitle>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </LayoutHeader>
        <LayoutContent>
          <FormSubmit
            formId={formID}
            serverSlug={serverSlug}
            questions={form.questions}
            title={form.title}
            description={form.description}
          />
        </LayoutContent>
      </Layout>
    </>
  );
}
