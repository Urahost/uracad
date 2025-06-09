import { Header } from "@/features/layout/header";
import type { PropsWithChildren } from "react";

export function BaseLayout(props: PropsWithChildren) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <div className="min-h-full flex-1 pt-8 pb-16 lg:pt-12">
        {props.children}
      </div>
    </div>
  );
}
