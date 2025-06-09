import type { User } from "better-auth";
import { nanoid } from "nanoid";
import { createServerQuery } from "../../query/server/server-create.query";
import { env } from "../env";
import { generateSlug, getNameFromEmail } from "../format/id";
import { resend } from "../mail/resend";

export const setupResendCustomer = async (user: User) => {
  if (!user.email) {
    return;
  }

  if (!env.RESEND_AUDIENCE_ID) {
    return;
  }

  const contact = await resend.contacts.create({
    audienceId: env.RESEND_AUDIENCE_ID,
    email: user.email,
    firstName: user.name || "",
    unsubscribed: false,
  });

  if (!contact.data) return;

  return contact.data.id;
};

export const setupDefaultServersOrInviteUser = async (user: User) => {
  if (!user.email || !user.id) {
    return;
  }

  const name = user.name || getNameFromEmail(user.email);
  const serverSlug = generateSlug(name);
  await createServerQuery({
    slug: serverSlug,
    name: `${name}'s server`,
    email: user.email,
    logo: user.image,
    id: nanoid(),
    createdAt: new Date(),
    members: {
      create: {
        userId: user.id,
        role: "owner",
        id: nanoid(),
        createdAt: new Date(),
      },
    },
  });
};
