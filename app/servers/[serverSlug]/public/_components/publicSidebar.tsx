"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { PiggyBank, HelpCircle, ChevronDown, LogIn } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PublicSidebar() {
  const t = useTranslations("PublicShare");
  const params = useParams<{ serverSlug: string }>();
  const { serverSlug } = params;
  const [open, setOpen] = useState(true);

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-primary" />
          <h2 className="font-semibold">{t("title")}</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <Collapsible 
          open={open} 
          onOpenChange={setOpen}
          className="group/collapsible"
        >
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                {t("navigation")}
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ul className="space-y-1 px-2 py-2">
                  <li>
                    <Link 
                      href={`/servers/${serverSlug}/public/fines`}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <PiggyBank className="h-4 w-4" />
                      {t("myFines")}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/servers/${serverSlug}/public/help`}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <HelpCircle className="h-4 w-4" />
                      {t("help")}
                    </Link>
                  </li>
                </ul>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      
      <SidebarFooter className="p-4 space-y-4">
        <Button 
          className="w-full" 
          variant="default"
          asChild
        >
          <Link href={`/servers/${serverSlug}/public/login`} className="flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" />
            {t("login")}
          </Link>
        </Button>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

export default PublicSidebar;
