import { Typography } from "@/components/uracad/typography";
import { Layout, LayoutContent } from "@/features/page/layout";
import { MDXRemote } from "next-mdx-remote-client/rsc";

const markdown = `Privacy demo`;

export default function page() {
  return (
    <div>
      <div className="bg-card flex w-full items-center justify-center p-8 lg:p-12">
        <Typography variant="h1">Privacy</Typography>
      </div>
      <Layout>
        <LayoutContent className="prose dark:prose-invert m-auto mb-8">
          <MDXRemote source={markdown} />
        </LayoutContent>
      </Layout>
    </div>
  );
}
