
import { Typography } from "@/components/uracad/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth/auth-user";
import { SiteConfig } from "@/site-config";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthSignUpPage() {
  const user = await getUser();

  if (user) {
    redirect("/");
  }

  return (
    <Card className="mx-auto w-full max-w-md lg:max-w-lg lg:p-6">
      <CardHeader className="flex flex-col items-center justify-center gap-1">
        <Avatar className="mb-4 rounded-sm size-18">
          <AvatarImage src={SiteConfig.appIcon} alt="app logo" />
          <AvatarFallback>
            {SiteConfig.title.substring(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <CardTitle>Sign up to {SiteConfig.title}</CardTitle>
        <CardDescription>
          Sign up using one of our social providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Button asChild variant="default" className="mt-4 w-full">
          <Link href="/auth/signin">
            Continue to Sign In
          </Link>
        </Button>

        <Typography variant="muted" className="mt-4 text-xs">
          You already have an account?{" "}
          <Typography variant="link" as={Link} href="/auth/signin">
            Sign in
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  );
}
