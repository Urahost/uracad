"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { logger } from "@/lib/logger";
import { z } from "zod";

const ToggleSubscribedActionSchema = z.object({
  unsubscribed: z.boolean(),
});

export const toggleSubscribedAction = authAction
  .schema(ToggleSubscribedActionSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    logger.debug("Toggle subscribed", { input, ctx });

    // TODO : Add Resend
    // if (!ctx.user.resendContactId) {
    //   throw new ActionError("User has no resend contact");
    // }

    // if (!env.RESEND_AUDIENCE_ID) {
    //   throw new ActionError("RESEND_AUDIENCE_ID is not set");
    // }

    // const updateContact = await resend.contacts.update({
    //   audienceId: env.RESEND_AUDIENCE_ID,
    //   id: ctx.user.resendContactId,
    //   unsubscribed: input.unsubscribed,
    // });

    return {
      success: true,
    };
  });
