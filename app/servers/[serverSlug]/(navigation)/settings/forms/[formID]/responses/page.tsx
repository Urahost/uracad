import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réponses du formulaire",
};

export default async function ResponsesPage({ params }: { params: { formID: string } }) {
  // Récupérer toutes les réponses avec les questions et les réponses associées
  const responses = await prisma.formResponse.findMany({
    where: { formId: await params.formID },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!responses.length) {
    return <div className="p-8 text-center text-muted-foreground">Aucune réponse pour ce formulaire.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Réponses au formulaire</h1>
      <Accordion type="single" collapsible className="w-full">
        {responses.map((response, idx) => (
          <AccordionItem value={response.id} key={response.id}>
            <AccordionTrigger>
              <span>Réponse n°{idx + 1} {response.userId ? <span className="text-xs text-muted-foreground">(User: {response.userId})</span> : null}</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Détail de la réponse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {response.answers.map((answer) => (
                    <div key={answer.id} className="border-b pb-2 mb-2">
                      <div className="font-semibold">{answer.question.label}</div>
                      <div className="text-muted-foreground break-words">{answer.value}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="text-xs text-muted-foreground">Soumis le {new Date(response.createdAt).toLocaleString()}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}