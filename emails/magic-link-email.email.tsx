import { SiteConfig } from "@/site-config";
import { Preview } from "@react-email/components";
import { EmailLink, EmailSection, EmailText } from "./utils/components.utils";
import { EmailLayout } from "./utils/email-layout";

export default function MagicLinkMail({ url }: { url: string }) {
  return (
    <EmailLayout>
      <Preview>
        You have requested a magic link to sign in to your account.
      </Preview>
      <EmailSection>
        <EmailText>Hello,</EmailText>
        <EmailText>You request a magic link :</EmailText>
        <EmailText>
          <EmailLink href={url}>Click here to sign in</EmailLink>
        </EmailText>
        <EmailText>
          If you didn't request this, please ignore this email.
        </EmailText>
      </EmailSection>
      <EmailText>
        Best,
        <br />- {SiteConfig.team.name} from {SiteConfig.title}
      </EmailText>
    </EmailLayout>
  );
}
