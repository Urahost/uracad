import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth/auth-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { PageParams } from "@/types/next";
import { AcceptInviteButton } from "./accept-invite-client";
import { logger } from "@/lib/logger";

export default async function PublicInvitePage(props: PageParams<{ inviteCode: string, serverSlug: string }>) {
  // Récupérer les paramètres
  const params = await props.params;
  const { inviteCode } = params;
  
  // Vérifier si le lien d'invitation existe et est valide
  const inviteLink = await prisma.inviteLink.findFirst({
    where: {
      code: inviteCode,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
      AND: [
        {
          OR: [
            { maxUses: null },
            { maxUses: { gt: prisma.inviteLink.fields.uses } },
          ],
        },
      ],
    },
    include: {
      organization: true,
    }
  });
  
  // Si le lien n'existe pas ou n'est pas valide
  if (!inviteLink) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Invalid Invitation</CardTitle>
            <CardDescription className="text-center">
              This invitation link is invalid, expired, or has been disabled.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Vérifier si l'utilisateur est déjà connecté
  const user = await getUser();
  
  // Vérifier si l'utilisateur est déjà membre de l'organisation
  const existingMember = user ? await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId: inviteLink.organizationId,
    },
  }) : null;
  
  // Si l'utilisateur est déjà membre, rediriger vers l'organisation
  if (existingMember) {
    redirect(`/servers/${inviteLink.organization.slug}`);
  }
  
  // Fonction pour accepter l'invitation
  async function acceptInvitation() {
    "use server";
    
    // Vérifier à nouveau si le lien est valide
    const inviteLink = await prisma.inviteLink.findFirst({
      where: {
        code: inviteCode,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
        AND: [
          {
            OR: [
              { maxUses: null },
              { maxUses: { gt: prisma.inviteLink.fields.uses } },
            ],
          },
        ],
      },
      include: {
        organization: true,
      }
    });
    
    if (!inviteLink) {
      return { error: "This invitation is no longer valid" };
    }
    
    const user = await getUser();
    if (!user) {
      // Si l'utilisateur n'est pas connecté, retourner un message d'erreur
      return { 
        needsAuth: true,
        callbackUrl: `/servers/${inviteLink.organization.slug}/public-share/invite/${inviteCode}`
      };
    }
    
    try {
      // Créer un nouveau membre
      await prisma.member.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          organizationId: inviteLink.organizationId,
          role: inviteLink.role,
          createdAt: new Date(),
        },
      });
      
      // Mettre à jour le compteur d'utilisations
      await prisma.inviteLink.update({
        where: { id: inviteLink.id },
        data: { uses: { increment: 1 } },
      });
      
      // Retourner les informations de succès pour la redirection côté client
      return { 
        success: true, 
        serverSlug: inviteLink.organization.slug ?? undefined
      };
    } catch (error) {
      logger.error("Error accepting invitation:", error);
      return { error: "Failed to accept invitation" };
    }
  }
  
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="size-16">
              {inviteLink.organization.logo ? (
                <AvatarImage src={inviteLink.organization.logo} alt={inviteLink.organization.name} />
              ) : null}
              <AvatarFallback>
                {inviteLink.organization.name.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle>Join {inviteLink.organization.name}</CardTitle>
          <CardDescription>
            You've been invited to join this organization as a{" "}
            <strong>
              {inviteLink.role.charAt(0).toUpperCase() + inviteLink.role.slice(1)}
            </strong>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          {user ? (
            <AcceptInviteButton action={acceptInvitation} />
          ) : (
            <Button asChild className="w-full">
              <Link href={`/auth/signin?callbackUrl=/servers/${inviteLink.organization.slug}/public-share/invite/${inviteCode}`}>
                Sign in to Accept
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild className="w-full">
            <Link href="/" className="flex items-center justify-center gap-1">
              <ExternalLink className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 