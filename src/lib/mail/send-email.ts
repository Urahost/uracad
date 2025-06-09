import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { nanoid } from "nanoid";
import { resend } from "./resend";

type ResendSendType = typeof resend.emails.send;
type ResendParamsType = Parameters<ResendSendType>;
type ResendParamsTypeWithConditionalFrom = [
  payload: Omit<ResendParamsType[0], "from"> & { from?: string },
  options?: ResendParamsType[1],
];

/**
 * sendEmail will send an email using resend.
 * To avoid repeating the same "from" email, you can leave it empty and it will use the default one.
 * Also, in development, it will add "[DEV]" to the subject.
 * @param params[0] : payload
 * @param params[1] : options
 * @returns a promise of the email sent
 */
export const sendEmail = async (
  ...params: ResendParamsTypeWithConditionalFrom
) => {
  if (env.NODE_ENV === "development") {
    params[0].subject = `[DEV] ${params[0].subject}`;
  }

  // Avoid sending emails to playwright-test emails
  if (
    Array.isArray(params[0].to)
      ? params[0].to.some((to) => to.startsWith("playwright-test-"))
      : params[0].to.startsWith("playwright-test-")
  ) {
    logger.info("[sendEmail] Sending email to playwright-test", {
      subject: params[0].subject,
      to: params[0].to,
    });
    return {
      error: null,
      data: {
        id: nanoid(),
      },
    };
  }

  const resendParams = [
    {
      from: params[0].from ?? env.RESEND_EMAIL_FROM,
      ...params[0],
    } as ResendParamsType[0],
    params[1],
  ] satisfies ResendParamsType;

  const result = await resend.emails.send(...resendParams);

  if (result.error) {
    logger.error("[sendEmail] Error", { result, subject: params[0].subject });
  }

  return result;
};
