import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { env } from "@/lib/env";
import { resend } from "@/lib/mail/resend";
import { combineWithParentMetadata } from "@/lib/metadata";
import { ToggleEmailCheckbox } from "./toggle-email-checkbox";

export const generateMetadata = combineWithParentMetadata({
  title: "Email",
  description: "Update your email notifications settings.",
});

export default async function MailProfilePage() {
  const resendContactId = "" as null | string;

  if (!resendContactId) {
    return <ErrorComponent />;
  }

  if (!env.RESEND_AUDIENCE_ID) {
    return <ErrorComponent />;
  }

  const { data: resendUser } = await resend.contacts.get({
    audienceId: env.RESEND_AUDIENCE_ID,
    id: resendContactId,
  });

  if (!resendUser) {
    return <ErrorComponent />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mail settings</CardTitle>
        <CardDescription>
          Update your email notifications settings to match your preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleEmailCheckbox unsubscribed={resendUser.unsubscribed} />
      </CardContent>
    </Card>
  );
}

const ErrorComponent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resend not found</CardTitle>
        <CardDescription>
          We couldn't find your Resend contact. Please contact support.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
