"use client";

import { Divider } from "@/components/uracad/divider";
import { useSearchParams } from "next/navigation";
import { ProviderButton } from "./provider-button";
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
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslations } from 'next-intl';

const MagicLinkFormSchema = z.object({
  email: z.string().email(),
});

type MagicLinkFormType = z.infer<typeof MagicLinkFormSchema>;

const MagicLinkForm = () => {
  const form = useZodForm({
    schema: MagicLinkFormSchema,
  });
  const t = useTranslations('Auth.signIn');

  const signInMutation = useMutation({
    mutationFn: async (values: MagicLinkFormType) => {
      return unwrapSafePromise(
        authClient.signIn.magicLink({
          email: values.email,
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success(t('magicLinkSent'));
      window.location.href = `${window.location.origin}/auth/verify`;
    },
  });

  function onSubmit(values: MagicLinkFormType) {
    signInMutation.mutate(values);
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="max-w-lg space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('emailLabel')}</FormLabel>
            <FormControl>
              <Input placeholder={t('emailPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <LoadingButton
        loading={signInMutation.isPending}
        type="submit"
        className="ring-offset-card w-full ring-offset-2"
      >
        {t('sendMagicLink')}
      </LoadingButton>
    </Form>
  );
};

export const SignInProviders = ({
  providers,
  callbackUrl,
}: {
  providers: string[];
  callbackUrl?: string;
}) => {
  const searchParams = useSearchParams();
  const callbackUrlParams = searchParams.get("callbackUrl");
  const t = useTranslations('Auth.signIn');

  if (!callbackUrl) {
    callbackUrl = callbackUrlParams as string;
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <MagicLinkForm />
      
      {providers.length > 0 && <Divider>{t('orContinueWith')}</Divider>}

      <div className="flex flex-col gap-2 lg:gap-4">
        {providers.includes("github") ? (
          <ProviderButton providerId="github" callbackUrl={callbackUrl} />
        ) : null}
        {providers.includes("google") ? (
          <ProviderButton providerId="google" callbackUrl={callbackUrl} />
        ) : null}
        {providers.includes("discord") ? (
          <ProviderButton providerId="discord" callbackUrl={callbackUrl} />
        ) : null}
      </div>

      {/* <Typography variant="muted" className="text-xs">
        {t('noAccount')}{" "}
        <Typography
          variant="link"
          as={Link}
          href={`/auth/signup?callbackUrl=${callbackUrl}`}
        >
          {t('signUp')}
        </Typography>
      </Typography> */}
    </div>
  );
};
