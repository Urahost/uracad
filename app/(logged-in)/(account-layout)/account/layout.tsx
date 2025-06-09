import { SubmitButton } from "@/features/form/submit-button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { auth } from "@/lib/auth";
import { getRequiredUser } from "@/lib/auth/auth-user";
import type { LayoutParams } from "@/types/next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RouteLayout(props: LayoutParams) {
  const user = await getRequiredUser();
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>
          {user.name ? `${user.name}'s` : "Your"} Settings
        </LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        <form>
          <SubmitButton
            formAction={async () => {
              "use server";
              await auth.api.signOut({
                headers: await headers(),
              });
              redirect("/auth/signin");
            }}
          >
            Sign out
          </SubmitButton>
        </form>
      </LayoutActions>
      <LayoutContent>{props.children}</LayoutContent>
    </Layout>
  );
}
