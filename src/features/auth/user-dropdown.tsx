"use client";

import { Loader } from "@/components/uracad/loader";
import { Typography } from "@/components/uracad/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import {
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  SunMedium,
  SunMoon,
  Globe,
} from "lucide-react";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import Image from 'next/image';
import { setUserLocale } from "@/i18n/service/locale";

export const UserDropdown = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const logout = useMutation({
    mutationFn: async () => signOut(),
    onSuccess: () => {
      void router.push("/auth/signin");
    },
  });
  const session = useSession();
  const theme = useTheme();

  if (!session.data?.user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {session.data.user.name ? (
            <>
              <Typography variant="small">
                {session.data.user.name || session.data.user.email}
              </Typography>
              <Typography variant="muted">{session.data.user.email}</Typography>
            </>
          ) : (
            <Typography variant="small">{session.data.user.email}</Typography>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/servers">
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <Settings className="mr-2 size-4" />
            Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="mr-2 size-4" />
            <span>Language</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={async () => setUserLocale('fr')}>
                <div className="flex items-center gap-2">
                  <Image src="/locales/FR.svg" alt="FR" width={16} height={12} />
                  <span>Français</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => setUserLocale('en')}>
                <div className="flex items-center gap-2">
                  <Image src="/locales/GB-NIR.svg" alt="GB" width={16} height={12} />
                  <span>English</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon className="mr-2 size-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => theme.setTheme("dark")}>
                <SunMedium className="mr-2 size-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => theme.setTheme("light")}>
                <Moon className="mr-2 size-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => theme.setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              logout.mutate();
            }}
          >
            {logout.isPending ? (
              <Loader className="mr-2 size-4" />
            ) : (
              <LogOut className="mr-2 size-4" />
            )}
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
