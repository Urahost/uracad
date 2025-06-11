import { z } from "zod";

// Schema for citizen data validation
export const CitizenSchema = z.object({
  id: z.string().optional(),
  image: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date(),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  fingerprint: z.string().nullable().optional(),
  bloodType: z.string().nullable().optional(),
  isDead: z.boolean().default(false),
  isHandcuffed: z.boolean().default(false),
  inJail: z.number().default(0),
  money: z.any().optional(),
  charinfo: z.any().optional(),
  job: z.any().optional(),
  gang: z.any().optional(),
  position: z.any().optional(),
  metadata: z.any().optional(),
  inventory: z.any().optional(),
});

export type CitizenSchemaType = z.infer<typeof CitizenSchema>; 