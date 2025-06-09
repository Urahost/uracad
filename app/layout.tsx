import { TailwindIndicator } from "@/components/utils/tailwind-indicator";
import { FloatingLegalFooter } from "@/features/legal/floating-legal-footer";
import { NextTopLoader } from "@/features/page/next-top-loader";
import { getServerUrl } from "@/lib/server-url";
import { cn } from "@/lib/utils";
import { SiteConfig } from "@/site-config";
import type { LayoutParams } from "@/types/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getCurrentServerCache } from "@/lib/react/cache";

export const metadata: Metadata = {
  title: SiteConfig.title,
  description: SiteConfig.description,
  metadataBase: new URL(getServerUrl()),
};

const CaptionFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-caption",
});

export default async function RootLayout({
  children,
  modal,
}: LayoutParams & { modal?: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const organization = await getCurrentServerCache();
  return (
    <>
      <html lang={locale} className="h-full" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={cn(
            "bg-background h-full font-sans antialiased",
            GeistMono.variable,
            GeistSans.variable,
            CaptionFont.variable,
          )}
        >
          <NuqsAdapter>
            <Providers organization={organization}>
              <NextTopLoader
                delay={100}
                showSpinner={false}
                color="hsl(var(--primary))"
              />
               <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
              {modal}
              <TailwindIndicator />
              <FloatingLegalFooter />
              </NextIntlClientProvider>
            </Providers>
          </NuqsAdapter>
        </body>
      </html>
    </>
  );
}
