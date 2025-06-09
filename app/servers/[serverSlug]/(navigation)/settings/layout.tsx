import { Layout, LayoutContent } from "@/features/page/layout";
import { combineWithParentMetadata } from "@/lib/metadata";
import type { LayoutParams } from "@/types/next";

export const generateMetadata = combineWithParentMetadata({
  title: "Settings",
  description: "Manage your organization settings.",
});

export default async function RouteLayout(
  props: LayoutParams<{ productId: string; serverSlug: string }>,
) {
  return (
    <Layout size="lg">
      <LayoutContent>{props.children}</LayoutContent>
    </Layout>
  );
}
