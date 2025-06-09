import { Logo } from "@/components/uracad/logo";
import { LoadingButton } from "@/features/form/submit-button";
import { authClient } from "@/lib/auth-client";
import { getCallbackUrl } from "@/lib/auth/auth-utils";
import { useMutation } from "@tanstack/react-query";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { useTranslations } from 'next-intl';

const ProviderData: Record<string, { icon: ReactNode; name: string }> = {
  github: {
    icon: <Logo name="github" size={16} />,
    name: "Github",
  },
  google: {
    icon: <Logo name="google" size={16} />,
    name: "Google",
  },
  discord: {
    icon: <Logo name="discord" size={16} />,
    name: "Discord",
  },
};

type ProviderButtonProps = {
  providerId: "github" | "google" | "discord";
  callbackUrl?: string;
};

export const ProviderButton = (props: ProviderButtonProps) => {
  const t = useTranslations('Auth.signIn');
  const githubSignInMutation = useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: props.providerId,
        callbackURL: getCallbackUrl(props.callbackUrl, "/"),
      });
    },
  });

  const data = ProviderData[props.providerId];

  return (
    <LoadingButton
      loading={githubSignInMutation.isPending}
      className={clsx({
        "border-gray-500 bg-white text-black hover:bg-white":
          data.name === "Google",
        "border-gray-500 bg-black text-white hover:bg-gray-950":
          data.name === "Github",
        "border-gray-500 bg-[#5865F2] text-white hover:bg-[#4752c4]":
          data.name === "Discord",
      })}
      size="lg"
      onClick={() => {
        githubSignInMutation.mutate();
      }}
    >
      {data.icon}
      <span className="ml-2 text-base">{t('continueWith')} {data.name}</span>
    </LoadingButton>
  );
};
