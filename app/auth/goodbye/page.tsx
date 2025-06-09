import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layout, LayoutContent } from "@/features/page/layout";
import Link from "next/link";

export default function GoodbyePage() {
  return (
    <Layout>
      <LayoutContent>
        <Card>
          <CardHeader>
            <CardTitle>Account Deleted</CardTitle>
            <CardDescription>
              Your account has been successfully deleted
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p>
              We're sorry to see you go. Your account and all associated data
              have been permanently removed from our system.
            </p>
            <p>
              If you change your mind, you're welcome to create a new account
              anytime.
            </p>
            <div className="flex justify-center pt-4">
              <Button asChild>
                <Link href="/auth/signup">Create New Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </LayoutContent>
    </Layout>
  );
}
