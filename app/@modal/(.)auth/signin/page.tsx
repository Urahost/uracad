import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InterceptDialog } from "@/components/utils/intercept-dialog";
import { SocialProviders } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { SiteConfig } from "@/site-config";
import { SignInModal } from "./signin";

export default function SignInDialogPage() {
  logger.debug("SignInDialog");
  return (
    <InterceptDialog>
      <DialogContent className="bg-card">
        <DialogHeader className="flex flex-col items-center justify-center gap-1">
          <Avatar className="mb-4 rounded-sm size-18">
            <AvatarImage src={SiteConfig.appIcon} alt="app logo" />
            <AvatarFallback>
              {SiteConfig.title.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <DialogTitle>Sign in to {SiteConfig.title}</DialogTitle>
          <DialogDescription>
            Please sign in to your account to continue.
          </DialogDescription>
        </DialogHeader>
        <SignInModal providers={Object.keys(SocialProviders ?? {})} />
      </DialogContent>
    </InterceptDialog>
  );
}
