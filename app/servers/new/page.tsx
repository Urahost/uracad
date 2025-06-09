import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { AccountNavigation } from "../../(logged-in)/(account-layout)/account-navigation";
import { NewServerForm } from "./new-server-form";

export default async function RoutePage() {
  await getRequiredUser();

  return (
    <AccountNavigation>
      <Layout>
        <LayoutHeader>
          <LayoutTitle>Create a new server</LayoutTitle>
        </LayoutHeader>
        <LayoutContent>
          <NewServerForm />
        </LayoutContent>
      </Layout>
    </AccountNavigation>
  );
}
