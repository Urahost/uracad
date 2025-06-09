import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { type InviteLink, InviteStatus } from "../../types/invite";
import { validateInvite, acceptInvite } from "../actions/invite";
import type { InviteCodeInput } from "../../actions/invite";

export function useInvite() {
  const params = useParams();
  const router = useRouter();
  const [invite, setInvite] = useState<InviteLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<InviteStatus>(InviteStatus.VALID);

  // Valider un code d'invitation
  const validateInviteCode = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const input: InviteCodeInput = { code };
      const response = await validateInvite(input.code);
      
      if (!response.success) {
        setError(response.error ?? "Erreur lors de la validation de l'invitation");
        
        // Déterminer le statut en fonction de l'erreur
        if (response.error?.includes("expirée")) {
          setStatus(InviteStatus.EXPIRED);
        } else if (response.error?.includes("limite d'utilisations")) {
          setStatus(InviteStatus.USED);
        } else if (response.error?.includes("désactivée")) {
          setStatus(InviteStatus.INACTIVE);
        } else {
          setStatus(InviteStatus.INVALID);
        }
        
        return;
      }

      if (!response.data) {
        setError("Données d'invitation manquantes");
        setStatus(InviteStatus.INVALID);
        return;
      }

      setInvite(response.data);
      setStatus(InviteStatus.VALID);
    } catch (err) {
      const error = err as Error;
      logger.error("Erreur de validation d'invite:", error);
      setError("Erreur lors de la validation de l'invitation");
      setStatus(InviteStatus.INVALID);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Valider l'invite au chargement
  useEffect(() => {
    const code = params.inviteCode as string;
    if (!code) {
      setError("Code d'invitation manquant");
      setStatus(InviteStatus.INVALID);
      setIsLoading(false);
      return;
    }

    validateInviteCode(code).catch((err) => {
      logger.error("Erreur lors de la validation initiale:", err);
    });
  }, [params.inviteCode, validateInviteCode]);

  // Accepter une invitation
  const acceptInviteCode = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const input: InviteCodeInput = { code };
      const response = await acceptInvite(input.code);
      
      if (!response.success) {
        setError(response.error ?? "Erreur lors de l'acceptation de l'invitation");
        
        if (response.error?.includes("déjà membre")) {
          toast.error("Vous êtes déjà membre de ce serveur");
        } else {
          toast.error("Erreur lors de l'acceptation de l'invitation");
        }
        
        return;
      }

      toast.success("Invitation acceptée avec succès");
      
      // Rediriger vers le serveur
      const serverSlug = invite?.organization.slug;
      if (serverSlug) {
        router.push(`/servers/${serverSlug}`);
      }
    } catch (err) {
      const error = err as Error;
      logger.error("Erreur d'acceptation d'invite:", error);
      setError("Erreur lors de l'acceptation de l'invitation");
      toast.error("Erreur lors de l'acceptation de l'invitation");
    } finally {
      setIsLoading(false);
    }
  }, [invite, router]);

  return {
    invite,
    isLoading,
    error,
    status,
    actions: {
      validateInvite: validateInviteCode,
      acceptInvite: acceptInviteCode,
    },
  };
} 