import { RESERVED_SLUGS } from "@/lib/servers/reserved-slugs";
import { z } from "zod";

/**
 * Warning
 * The schema here is used in settings.action.ts with `z.union`
 * You should never make all properties optional in a union schema
 * because `union` will always return the first schema that matches
 * So if you make all properties optional, the first schema will always match
 * and the second schema will never be used
 */
export const ServerDetailsFormSchema = z.object({
  // This field need to be here not in DangerFormSchema
  // slug: z.string().refine((v) => !RESERVED_SLUGS.includes(v), {
  //   message: "This server slug is reserved",
  // }),
  name: z.string(),
  logo: z.string().nullable().optional(),
});

export const ServerDangerFormSchema = z.object({
  // We can add live check for slug availability
  slug: z.string().refine((v) => !RESERVED_SLUGS.includes(v), {
    message: "This server slug is reserved",
  }),
});

export type ServerDetailsFormSchemaType = z.infer<typeof ServerDetailsFormSchema>;
export type ServerDangerFormSchemaType = z.infer<typeof ServerDangerFormSchema>;
