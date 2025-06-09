"use server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendDiscordWebhook } from "../../../../../../src/lib/discord-webhook";

export async function submitFormResponse(formId: string, serverSlug: string, formData: FormData) {
  const answers = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("question_"))
    .map(([key, value]) => ({
      questionId: key.replace("question_", ""),
      value: value.toString()
    }));

  try {
    await prisma.formResponse.create({
      data: {
        formId,
        answers: {
          create: answers.map(a => ({
            questionId: a.questionId,
            value: a.value
          }))
        }
      }
    });

    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        title: true,
        webhookUrl: true,
        questions: { select: { id: true, label: true } }
      }
    });
    if (form?.webhookUrl) {
      const fields = answers.map(a => {
        const question = form.questions.find((q: { id: string }) => q.id === a.questionId);
        return {
          name: question?.label ?? "Question",
          value: a.value,
        };
      });
      await sendDiscordWebhook(form.webhookUrl, {
        username: "Formulaire",
        content: `Nouvelle réponse au formulaire **${form.title}**`,
        embeds: [
          {
            title: "Réponses",
            color: 0x5865F2,
            fields,
            timestamp: new Date().toISOString(),
          }
        ]
      });
    }

    revalidatePath(`/servers/${serverSlug}/public/forms/${formId}`, "page");
    redirect(`/servers/${serverSlug}/public/forms/${formId}/success`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    logger.error("Erreur lors de la soumission du formulaire:", error);
    throw new Error("Une erreur est survenue lors de la soumission du formulaire");
  }
} 