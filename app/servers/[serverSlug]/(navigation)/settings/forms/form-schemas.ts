import { z } from "zod";

export const QuestionSchema = z.object({
  label: z.string().min(1),
  type: z.enum(["text", "textarea", "select", "checkbox", "radio"]),
  options: z.string().optional(), // JSON string pour select/radio/checkbox
  required: z.boolean().default(false),
  order: z.number().default(0),
});

export const FormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string(),
  questions: z.array(QuestionSchema),
}); 