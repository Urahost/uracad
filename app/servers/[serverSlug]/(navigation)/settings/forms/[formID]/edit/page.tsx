import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { prisma } from "@/lib/prisma";
import { FormBuilder } from "../../FormBuilder";

export default async function EditFormPage({ params }: { params: { formID: string } }) {
  const server = await getRequiredCurrentServerCache();
  const form = await prisma.form.findUnique({
    where: { id: params.formID },
    include: { questions: true },
  });
  if (!form) return <div className="p-8 text-center">Formulaire introuvable</div>;

  return (
    <FormBuilder
      organizationId={server.id}
      serverSlug={server.slug}
      initialForm={form}
    />
  );
}
