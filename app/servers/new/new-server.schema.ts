import { RESERVED_SLUGS } from "@/lib/servers/reserved-slugs";
import { z } from "zod";

export const CreateServerSchema = z.object({
  // We can add live check for slug availability
  slug: z.string().refine((v) => !RESERVED_SLUGS.includes(v), {
    message: "This server slug is reserved",
  }),
  name: z.string(),
});

export type NewServerSchemaType = z.infer<typeof CreateServerSchema>;
