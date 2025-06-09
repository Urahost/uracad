"use client";

import { useInvite } from "./hooks/use-invite";
import { InviteAcceptForm } from "./components/invite-accept-form";
import { InviteDetails } from "./components/invite-details";
import { InviteContainer } from "./components/invite-container";
import { InviteStatus } from "../types/invite";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function InvitePage() {
  const { invite, isLoading, error, status, actions } = useInvite();

  // Afficher le chargement
  if (isLoading) {
    return (
      <InviteContainer>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Chargement de l'invitation...</p>
            </div>
          </CardContent>
      </InviteContainer>
    );
  }

  // Afficher les erreurs
  if (error || status !== InviteStatus.VALID) {
    return (
      <InviteContainer>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invitation invalide
            </CardTitle>
            <CardDescription>
              {status === InviteStatus.EXPIRED && "Cette invitation a expiré"}
            {status === InviteStatus.USED && "Cette invitation a atteint sa limite d'utilisations"}
              {status === InviteStatus.INACTIVE && "Cette invitation a été désactivée"}
            {status === InviteStatus.INVALID && "Cette invitation n'existe pas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                {error ?? "Impossible de valider cette invitation"}
              </AlertDescription>
            </Alert>
          </CardContent>
      </InviteContainer>
    );
  }

  // Afficher le formulaire d'acceptation
  return (
    <InviteContainer>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Invitation valide
          </CardTitle>
          <CardDescription>
            Vous avez été invité à rejoindre {invite?.organization.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <InviteDetails invite={invite} />
          <InviteAcceptForm 
            code={invite?.code ?? ""} 
            onAccept={actions.acceptInvite}
          />
        </CardContent>
    </InviteContainer>
  );
}
