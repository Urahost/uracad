"use client";

import { Typography } from "@/components/uracad/typography";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/features/form/submit-button";
import { authClient } from "@/lib/auth-client";
import { getCallbackUrl } from "@/lib/auth/auth-utils";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";
import { z } from "zod";

const LoginCredentialsFormScheme = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
});

type LoginCredentialsFormType = z.infer<typeof LoginCredentialsFormScheme>;

export const SignInCredentialsAndMagicLinkForm = (props: {
  callbackUrl?: string;
}) => {
  const form = useZodForm({
    schema: LoginCredentialsFormScheme,
  });
  const [isUsingCredentials, setIsUsingCredentials] = useLocalStorage(
    "sign-in-with-credentials",
    true,
  );

  const signInMutation = useMutation({
    mutationFn: async (values: LoginCredentialsFormType) => {
      if (isUsingCredentials) {
        return unwrapSafePromise(
          authClient.signIn.email({
            email: values.email,
            password: values.password ?? "",
            rememberMe: true,
          }),
        );
      } else {
        return unwrapSafePromise(
          authClient.signIn.magicLink({
            email: values.email,
          }),
        );
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      const callbackUrl = getCallbackUrl(props.callbackUrl, "/orgs");
      const newUrl =
        window.location.origin +
        (isUsingCredentials ? callbackUrl : "/auth/verify");
      window.location.href = newUrl;
    },
  });

  function onSubmit(values: LoginCredentialsFormType) {
    signInMutation.mutate(values);
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="max-w-lg space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="john@doe.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {isUsingCredentials ? (
        <>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex-1">
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/auth/forget-password"
                    className="text-sm underline"
                    tabIndex={2}
                  >
                    Forgot password ?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : null}

      <LoadingButton
        loading={signInMutation.isPending}
        type="submit"
        className="ring-offset-card w-full ring-offset-2"
      >
        {isUsingCredentials ? "Sign in" : "Sign in with magic link"}
      </LoadingButton>

      {isUsingCredentials ? (
        <Typography variant="muted" className="text-xs">
          Forgot password ?{" "}
          <Typography
            variant="link"
            as="button"
            type="button"
            onClick={() => {
              setIsUsingCredentials(false);
            }}
          >
            Login with magic link
          </Typography>
        </Typography>
      ) : (
        <Typography
          variant="link"
          as="button"
          type="button"
          className="text-xs"
          onClick={() => {
            setIsUsingCredentials(true);
          }}
        >
          Use password
        </Typography>
      )}
    </Form>
  );
};
