import type { AuthRole } from "@/lib/auth/auth-permissions";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import type { LucideIcon } from "lucide-react";

export type NavigationGroup = {
  title: string;
  roles?: AuthRole[];
  links: NavigationLink[];
  defaultOpenStartPath?: string;
};

export type NavigationLink = {
  href: string;
  Icon:
    | React.ForwardRefExoticComponent<
        IconProps & React.RefAttributes<SVGSVGElement>
      >
    | LucideIcon;
  label: string;
  roles?: AuthRole[];
  permissions?: string[];
  hidden?: boolean;
  links?: NavigationLink[];
};
