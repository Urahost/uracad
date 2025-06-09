import type { LayoutParams } from "@/types/next";
import { ServerNavigationWrapper } from "./_navigation/server-navigation-wrapper";
import { PermissionWrapper } from "./permission-wrapper";

export default async function RouteLayout(
  props: LayoutParams<{ serverSlug: string }>,
) {
  const params = await props.params;
  
  return (
    <ServerNavigationWrapper>
      <PermissionWrapper serverSlug={params.serverSlug}>
        {props.children}
      </PermissionWrapper>
    </ServerNavigationWrapper>
  );
}
