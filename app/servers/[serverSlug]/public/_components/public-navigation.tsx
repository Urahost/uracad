"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Layout } from "@/features/page/layout";
import type { PropsWithChildren } from "react";
import { PublicSidebar } from "./publicSidebar";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";


export function PublicNavigation({ children }: PropsWithChildren) {

  return (
    <SidebarProvider>
      <PublicSidebar />
      <SidebarInset className="border-accent flex h-screen flex-col border">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <Layout size="lg" className="flex items-center justify-between gap-2">
            <SidebarTrigger
              size="lg"
              variant="outline"
              className="size-9 cursor-pointer"
            />
            <div className="flex items-end justify-end gap-2">
                <LocaleSwitcher />
                <ThemeToggle />
            </div>
          </Layout>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="h-full p-4 pt-0">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default PublicNavigation;
