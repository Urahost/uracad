import { combineWithParentMetadata } from "@/lib/metadata";
import PublicNavigation from "./_components/public-navigation";
import { prisma } from "@/lib/prisma";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import { OrganizationThemeProvider } from "@/components/organization-theme-provider";

export async function generateMetadata({ params }: { params: { serverSlug: string } }) {
  // Attendre les paramètres
  const { serverSlug } = await Promise.resolve(params);

  // Valider le serverSlug en récupérant l'organisation
  const organization = await prisma.organization.findUnique({
    where: { slug: serverSlug },
    select: { name: true },
  });

  if (!organization) {
    notFound();
  }

  return combineWithParentMetadata({
    title: `${organization.name} - Public`,
    description: "Public pages.",
  });
}

type PublicLayoutParams = {
  params: {
    serverSlug: string;
  };
  children: React.ReactNode;
};

export default async function RouteLayout({ params, children }: PublicLayoutParams) {
  // Attendre les paramètres
  const { serverSlug } = await Promise.resolve(params);

  // Récupérer les métadonnées de l'organisation
  const organization = await prisma.organization.findUnique({
    where: {
      slug: serverSlug,
    },
    select: {
      metadata: true,
      id: true,
      name: true,
    },
  });

  if (!organization) {
    notFound();
  }


  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <OrganizationThemeProvider metadata={organization.metadata}>
        <div className="flex h-screen w-full overflow-hidden">
          <PublicNavigation>{children}</PublicNavigation>
        </div>
        </OrganizationThemeProvider>
    </ThemeProvider>
  );
}
