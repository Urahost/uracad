"use server";

import { prisma } from "@/lib/prisma";
import type { FormSchema, QuestionSchema } from "./form-schemas";
import type { z } from "zod";

// Lister les formulaires
export async function listForms(organizationId: string) {
  return prisma.form.findMany({
    where: { organizationId },
    include: { 
      questions: true,
      _count: {
        select: { responses: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

// Créer un formulaire
export async function createForm(data: z.infer<typeof FormSchema>) {
  return prisma.form.create({
    data: {
      title: data.title,
      description: data.description,
      organizationId: data.organizationId,
      questions: {
        create: data.questions.map((q, i) => ({
          ...q,
          order: i,
        })),
      },
    },
    include: { questions: true },
  });
}

// Éditer un formulaire (titre/description)
export async function updateForm(formId: string, data: { title?: string; description?: string }) {
  return prisma.form.update({
    where: { id: formId },
    data,
  });
}

// Supprimer un formulaire
export async function deleteForm(formId: string) {
  return prisma.form.delete({ where: { id: formId } });
}

// Ajouter une question à un formulaire
export async function addQuestion(formId: string, question: z.infer<typeof QuestionSchema>) {
  return prisma.question.create({
    data: { ...question, formId },
  });
}

// Modifier une question
export async function updateQuestion(questionId: string, data: Partial<z.infer<typeof QuestionSchema>>) {
  return prisma.question.update({
    where: { id: questionId },
    data,
  });
}

// Supprimer une question
export async function deleteQuestion(questionId: string) {
  return prisma.question.delete({ where: { id: questionId } });
}

// Soumettre une réponse à un formulaire
export async function submitFormResponse(formId: string, answers: { questionId: string; value: string }[], userId?: string) {
  return prisma.formResponse.create({
    data: {
      formId,
      userId,
      answers: {
        create: answers.map(a => ({ questionId: a.questionId, value: a.value })),
      },
    },
    include: { answers: true },
  });
}

// Mettre à jour le webhook Discord d'un formulaire (et les mentions)
export async function updateFormWebhook(formId: string, webhookUrl: string, roleMentions: string, userMentions: string) {
  const webhookMentions = JSON.stringify({
    roles: roleMentions.split(",").map(s => s.trim()).filter(Boolean),
    users: userMentions.split(",").map(s => s.trim()).filter(Boolean),
  });
  return prisma.form.update({
    where: { id: formId },
    data: { webhookUrl, webhookMentions },
  });
}

// Mettre à jour un formulaire avec ses questions
export async function updateFormWithQuestions(formId: string, data: { 
  title: string; 
  description: string; 
  questions: { 
    label: string; 
    type: string; 
    options?: string; 
    required: boolean; 
    order: number; 
  }[] 
}) {
  // Supprimer toutes les questions existantes
  await prisma.question.deleteMany({
    where: { formId }
  });

  // Mettre à jour le formulaire et créer les nouvelles questions
  return prisma.form.update({
    where: { id: formId },
    data: {
      title: data.title,
      description: data.description,
      questions: {
        create: data.questions.map((q, i) => ({
          ...q,
          order: i,
        })),
      },
    },
    include: { questions: true },
  });
} 