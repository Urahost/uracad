import { getRequiredUser } from "@/lib/auth/auth-user";
import type { LayoutParams } from "@/types/next";
import type { Metadata } from "next";
import { AccountNavigation } from "./account-navigation";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account settings.",
};

export default async function RouteLayout(props: LayoutParams) {
  await getRequiredUser();

  return <AccountNavigation>{props.children}</AccountNavigation>;
}
