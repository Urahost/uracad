import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { SocialProviders } from "@/lib/auth";
import { getUser } from "@/lib/auth/auth-user";
import { SiteConfig } from "@/site-config";
import type { PageParams } from "@/types/next";
import { redirect } from "next/navigation";
import { SignInProviders } from "./sign-in-providers";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('Auth.signIn');
  
  return {
    title: `${t('title')} ${SiteConfig.title}`,
  };
}

export default async function AuthSignInPage(props: PageParams) {
  const user = await getUser();
  const t = await getTranslations('Auth.signIn');
  const searchParams = await props.searchParams;
  const callbackUrl = typeof searchParams.callbackUrl === 'string' ? searchParams.callbackUrl : '/account';

  if (user) {
    redirect(callbackUrl);
  }

  const providers = Object.keys(SocialProviders ?? {});
  

  return (
    <Card className="mx-auto w-full max-w-md lg:max-w-lg lg:p-6">
      <CardHeader>
        <div className="flex justify-center">
          <Avatar className="size-16 rounded-md">
            <AvatarImage src={SiteConfig.appIcon} alt="app logo" />
            <AvatarFallback>
              {SiteConfig.title.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardHeader className="text-center">
          {t('title')} {SiteConfig.title}
        </CardHeader>

        <CardDescription className="text-center">
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-8">
        <SignInProviders providers={providers} />
      </CardContent>
    </Card>
  );
}
