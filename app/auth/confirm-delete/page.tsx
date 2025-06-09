import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layout, LayoutContent } from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import { ConfirmDeletePage } from "./confirm-delete-page";

export default async function ConfirmDelete(props: PageParams) {
  const searchParams = await props.searchParams;
  const token = searchParams.token as string | undefined;
  const callbackUrl = searchParams.callbackUrl as string | undefined;

  return (
    <Layout>
      <LayoutContent>
        <Card>
          <CardHeader>
            <CardTitle>Confirm Account Deletion</CardTitle>
            <CardDescription>
              Are you sure you want to delete your account?
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <ConfirmDeletePage token={token} callbackUrl={callbackUrl} />
          </CardContent>
        </Card>
      </LayoutContent>
    </Layout>
  );
}
