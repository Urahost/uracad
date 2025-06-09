import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { InviteLink } from "../../types/invite";

type InviteDetailsProps = {
  invite: InviteLink | null;
}

export function InviteDetails({ invite }: InviteDetailsProps) {
  if (!invite) return null;

  // Formater la date d'expiration
  const formatExpiration = () => {
    if (!invite.expiresAt) return "Jamais";
    return formatDistanceToNow(new Date(invite.expiresAt), {
      addSuffix: true,
      locale: fr,
    });
  };

  // Formater le rôle
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Informations du serveur */}
        <div className="flex items-center gap-4">
          {invite.organization.logo ? (
            <img
              src={invite.organization.logo}
              alt={invite.organization.name}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-semibold">
                {invite.organization.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold">{invite.organization.name}</h3>
            <p className="text-sm text-muted-foreground">
              {invite.uses} {invite.maxUses ? `/ ${invite.maxUses}` : ""} utilisations
            </p>
          </div>
        </div>

        <Separator />

        {/* Détails de l'invitation */}
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rôle</span>
            <Badge variant="secondary">{formatRole(invite.role)}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expire</span>
            <span>{formatExpiration()}</span>
          </div>
          {invite.createdByName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Créé par</span>
              <span>{invite.createdByName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 