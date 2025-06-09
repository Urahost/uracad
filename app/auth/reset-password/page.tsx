import type { PageParams } from "@/types/next";
import { ResetPasswordPage } from "./reset-password-page";

export default async function RoutePage(props: PageParams) {
  const searchParams = await props.searchParams;
  const token = searchParams.token as string;

  return <ResetPasswordPage token={token} />;
}
