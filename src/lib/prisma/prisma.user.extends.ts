import type { Prisma } from "@prisma/client";
import type {
  DefaultArgs,
  DynamicQueryExtensionCb,
  InternalArgs,
} from "@prisma/client/runtime/library";
import { env } from "process";
import { resend } from "../mail/resend";
import { prisma } from "../prisma";

export const onUserUpdate: DynamicQueryExtensionCb<
  Prisma.TypeMap<InternalArgs & DefaultArgs, Prisma.PrismaClientOptions>,
  "model",
  "User",
  "update"
> = async (...params) => {
  await syncWithResendContact(...params);

  const [{ args, query }] = params;
  return query(args);
};

/**
 * When the user change email, we need to update the Resend contact.
 */
const syncWithResendContact: DynamicQueryExtensionCb<
  Prisma.TypeMap<InternalArgs & DefaultArgs, Prisma.PrismaClientOptions>,
  "model",
  "User",
  "update"
> = async ({ args }) => {
  const userId = args.where.id;

  if (!userId) {
    return;
  }

  if (!args.data.email) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      resendContactId: true,
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

  if (!user?.resendContactId) {
    return;
  }

  if (!env.RESEND_AUDIENCE_ID) {
    return;
  }

  await resend.contacts.remove({
    audienceId: env.RESEND_AUDIENCE_ID,
    id: user.resendContactId,
  });

  // const newResendContactId = await setupResendCustomer(user);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      // resendContactId: newResendContactId,
    },
  });
};
