import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { ServerDangerForm } from "./server-danger-form";
import { ServerDeleteDialog } from "./server-delete-dialog";

export const generateMetadata = combineWithParentMetadata({
  title: "Danger",
  description: "Delete your server.",
});

export default async function RoutePage(props: PageParams) {
  const server = await getRequiredCurrentServerCache({
    permissions: {
      organization: ["delete"],
    },
  });

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <ServerDangerForm defaultValues={server} />
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Delete the server</CardTitle>
          <CardDescription>
            By deleting your server, you will lose all your data will be cancelled.
          </CardDescription>
          <CardDescription>No refund will be provided.</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-2 border-t">
          <ServerDeleteDialog server={server} />
        </CardFooter>
      </Card>
    </div>
  );
}
