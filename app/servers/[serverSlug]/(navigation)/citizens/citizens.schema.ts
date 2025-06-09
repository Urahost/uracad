import { z } from "zod";

// Schema for citizen data validation
export const CitizenSchema = z.object({
  id: z.string().optional(),
  image: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  dateOfBirth: z.coerce.date(),
  socialSecurityNumber: z.string().nullable().optional(),
  gender: z.string().min(1, "Gender is required"),
  ethnicity: z.string().nullable().optional(),
  hairColor: z.string().nullable().optional(),
  eyeColor: z.string().nullable().optional(),
  weight: z.coerce.number().nullable().optional(),
  height: z.coerce.number().nullable().optional(),
  address: z.string().min(1, "Address is required"),
  postal: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  additionalInfo: z.string().nullable().optional(),
  driversLicense: z.string().nullable().optional(),
  driversLicenseCategories: z.string().nullable().optional(),
  pilotLicense: z.string().nullable().optional(),
  pilotLicenseCategories: z.string().nullable().optional(),
  waterLicense: z.string().nullable().optional(),
  waterLicenseCategories: z.string().nullable().optional(),
  firearmsLicense: z.string().nullable().optional(),
  firearmsLicenseCategories: z.string().nullable().optional(),
});

export type CitizenSchemaType = z.infer<typeof CitizenSchema>; 