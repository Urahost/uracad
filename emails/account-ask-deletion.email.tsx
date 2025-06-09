import { SiteConfig } from "@/site-config";
import { Preview, Text } from "@react-email/components";
import { EmailLink, EmailSection, EmailText } from "./utils/components.utils";
import { EmailLayout } from "./utils/email-layout";

export default function AccountAskDeletionEmail({
  serversToDelete,
  confirmUrl,
}: {
  serversToDelete: string[];
  confirmUrl: string;
}) {
  return (
    <EmailLayout>
      <Preview>
        Action required: You need to confirm your account deletion.
      </Preview>
      <EmailSection>
        <EmailText>Hi,</EmailText>
        <EmailText>
          You have requested the deletion of your account. The deletion is not
          yet effective. Please confirm your request by clicking the link below:
        </EmailText>
        <EmailText>
          <EmailLink href={confirmUrl}>
            👉 Confirm Account Deletion 👈
          </EmailLink>
        </EmailText>
        <EmailText>
          You have 1 hour to confirm your request. After, the request will be
          invalid.
        </EmailText>
        {serversToDelete.length > 0 && (
          <EmailText>
            The following servers will also be deleted:
            <ul>
              {serversToDelete.map((server) => (
                <li key={server}>{server}</li>
              ))}
            </ul>
          </EmailText>
        )}
      </EmailSection>
      <Text className="text-lg leading-6">
        Best,
        <br />- {SiteConfig.team.name} from {SiteConfig.title}
      </Text>
    </EmailLayout>
  );
}
