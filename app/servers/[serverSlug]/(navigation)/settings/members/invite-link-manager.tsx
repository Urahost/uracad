"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { CopyIcon, RefreshCw, Trash } from 'lucide-react';
import type { Control } from "react-hook-form";

// Composants UI
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useZodForm,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/features/form/submit-button";
import { RolesKeys } from "@/lib/auth/auth-permissions";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

// Actions
import { 
  createInviteLink, 
  getInviteLinks,
  updateInviteLink,
  regenerateInviteLink,
  deleteInviteLink 
} from "./invite-links.action";

// ======== Types et schémas ========

// Schéma pour les liens d'invitation
export const LinkSchema = z.object({
  role: z.string().default("member"),
  expiresIn: z.enum(["1h", "6h", "12h", "1d", "7d", "30d", "never"]).default("7d"),
  maxUses: z.enum(["1", "5", "10", "25", "50", "100", "unlimited"]).default("unlimited"),
});

export type LinkSchemaType = z.infer<typeof LinkSchema>;

// Type pour le lien d'invitation
export type InviteLink = {
  id: string;
  code: string;
  url: string;
  role: string;
  uses: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  createdByName: string | null;
  organizationId: string;
  organization: { 
    slug: string;
    name: string;
    logo?: string | null;
  };
  displayId?: string;
  optimistic?: boolean;
};

// ======== Fonctions utilitaires ========

// Formatage des rôles
const formatRoleName = (role?: string): string => {
  if (!role) return "Inconnu";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

// Formatage des dates d'expiration
const formatExpiration = (expiresAt: string | null): string => {
  if (!expiresAt) return "Jamais";
  
  try {
    const expDate = new Date(expiresAt);
    const now = new Date();
    
    // Vérifier si la date est valide
    if (isNaN(expDate.getTime())) return "Date invalide";
    
    if (expDate < now) return "Expiré";
    
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `Expire dans ${diffDays} jour${diffDays !== 1 ? 's' : ''}`;
    }
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    return `Expire dans ${diffHours} heure${diffHours !== 1 ? 's' : ''}`;
  } catch (error) {
    logger.error("Erreur lors du formatage de la date:", error);
    return "Date invalide";
  }
};

// Liste des options d'expiration
const EXPIRATION_OPTIONS = [
  { value: "1h", label: "1 heure" },
  { value: "6h", label: "6 heures" },
  { value: "12h", label: "12 heures" },
  { value: "1d", label: "1 jour" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "never", label: "Jamais" },
];

// Liste des options d'utilisations maximales
const MAX_USES_OPTIONS = [
  { value: "1", label: "1 utilisation" },
  { value: "5", label: "5 utilisations" },
  { value: "10", label: "10 utilisations" },
  { value: "25", label: "25 utilisations" },
  { value: "50", label: "50 utilisations" },
  { value: "100", label: "100 utilisations" },
  { value: "unlimited", label: "Illimité" },
];

// Sélecteur de rôle réutilisable
type RoleSelectorProps = {
  control: Control<Record<string, unknown>>;
  name: string;
  label?: string;
  placeholder?: string;
};

const RoleSelector = ({ control, name, label = "Rôle", placeholder = "Sélectionner un rôle" }: RoleSelectorProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select 
          onValueChange={field.onChange} 
          defaultValue={field.value as string}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {RolesKeys.filter(role => role !== "owner").map((role, index) => (
              <SelectItem 
                key={`${name}-role-${role}-${index}`} 
                value={role.toLowerCase()}
              >
                {formatRoleName(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    )}
  />
);

// Badge de statut pour les liens
type StatusBadgeProps = {
  isActive: boolean;
  isOptimistic?: boolean;
};

const StatusBadge = ({ isActive, isOptimistic }: StatusBadgeProps) => (
  <span className={cn(
    "text-xs px-2 py-1 rounded-full",
    isOptimistic ? "bg-gray-100 text-gray-800" :
    isActive 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800"
  )}>
    {isOptimistic ? "En attente..." : isActive ? "Actif" : "Désactivé"}
  </span>
);

// Badge de rôle
type RoleBadgeProps = {
  role: string;
};

const RoleBadge = ({ role }: RoleBadgeProps) => (
  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
    {formatRoleName(role)}
  </span>
);

// ======== Composant principal ========
export type InviteLinkManagerProps = {
  onCopySuccess?: (url: string) => void;
  serverSlug?: string;
};

export function InviteLinkManager({ onCopySuccess, serverSlug = "" }: InviteLinkManagerProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Formulaire pour création de liens
  const linkForm = useZodForm({
    schema: LinkSchema,
    defaultValues: { role: "member", expiresIn: "7d", maxUses: "unlimited" },
  });

  // Query pour récupérer et gérer les liens d'invitation
  const {
    data: inviteLinks = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['inviteLinks'],
    queryFn: async () => {
      const links = await getInviteLinks();
      return links.map(link => ({
        ...link,
        expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString() : null,
        createdAt: new Date(link.createdAt).toISOString(),
        updatedAt: new Date(link.updatedAt).toISOString(),
        displayId: link.id || `link-${Math.random().toString(36).slice(2)}`,
      })) as InviteLink[];
    },
    staleTime: 30000, // 30 secondes avant de considérer les données comme obsolètes
    refetchOnWindowFocus: true,
  });

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(text);
      onCopySuccess?.(text);
      setTimeout(() => setCopySuccess(null), 2000);
      toast.success("Lien copié dans le presse-papier");
    } catch (err) {
      toast.error("Impossible de copier le lien");
      logger.error(err);
    }
  };

  // Create invitation link with optimistic update
  const generateLinkMutation = useMutation({
    mutationFn: async (values: LinkSchemaType) => {
      return createInviteLink({
        role: values.role,
        expiresIn: values.expiresIn,
        maxUses: values.maxUses,
      });
    },
    onMutate: async (values) => {
      const currentSlug = serverSlug || window.location.pathname.split('/')[2] || "";
      
      if (!currentSlug) {
        logger.error("Impossible de déterminer le slug du serveur");
        return { optimisticLink: null };
      }
      
      // Création d'un lien optimistique
      const optimisticLink = createOptimisticLink(values, currentSlug);
      
      // Copie du lien optimistique immédiatement
      void copyToClipboard(optimisticLink.url);
      
      return { optimisticLink };
    },
    onSuccess: async (response, _variables) => {
      // Récupération des données réelles après création
      if (response) {
        // Actualiser la liste des liens
        await refetch();
        toast.success("Lien d'invitation généré");
      } else {
        toast.error("Erreur lors de la création du lien");
      }

      // Réinitialiser le formulaire
      linkForm.reset({ role: "member", expiresIn: "7d", maxUses: "unlimited" });
    },
    onError: (error, _variables) => {
      toast.error("Erreur lors de la création du lien d'invitation");
      logger.error(error);
      // En cas d'erreur, on actualise pour enlever le lien optimistique
      void refetch();
    },
  });

  // Toggle link active state
  const toggleLinkActiveMutation = useMutation({
    mutationFn: async ({ linkId, currentState }: { linkId: string; currentState: boolean }) => {
      return await updateInviteLink({
        id: linkId,
        isActive: !currentState
      }) as unknown as InviteLink;
    },
    onMutate: async () => {
      // Optimistic update
      const previousLinks = [...inviteLinks];
      
      return { previousLinks };
    },
    onSuccess: async () => {
      await refetch();
      toast.success("Statut du lien mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du lien");
      logger.error(error);
      void refetch();
    },
  });

  // Regenerate link
  const regenerateLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return await regenerateInviteLink({ id: linkId }) as unknown as InviteLink;
    },
    onSuccess: async (response, linkId) => {
      await refetch();
      
      // Trouver le lien mis à jour pour copier son URL
      const updatedLink = inviteLinks.find(link => link.id === linkId);
      if (updatedLink) {
        void copyToClipboard(updatedLink.url);
      }
      
      toast.success("Lien régénéré avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la régénération du lien");
      logger.error(error);
    },
  });

  // Delete link
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return deleteInviteLink({ id: linkId });
    },
    onMutate: async () => {
      // Optimistic update
      const previousLinks = [...inviteLinks];
      
      return { previousLinks };
    },
    onSuccess: async () => {
      await refetch();
      toast.success("Lien supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du lien");
      logger.error(error);
      void refetch();
    },
  });

  // Gérer l'affichage des liens avec l'optimistic UI
  let displayLinks = inviteLinks;
  
  // Ajouter le lien optimistique si une mutation est en cours
  if (generateLinkMutation.isPending) {
    // TypeScript sait que variables existe quand isPending est true
    const optimisticLink = createOptimisticLink(
      generateLinkMutation.variables,
      serverSlug || window.location.pathname.split('/')[2] || ""
    );
    displayLinks = [...inviteLinks, optimisticLink];
  }

  return (
    <div className="max-w-xl w-full mx-auto flex flex-col gap-8 px-2 sm:px-4 py-2">
      {/* Générer un nouveau lien */}
      <section className="rounded-lg border p-4 flex flex-col gap-4 bg-background">
        <h3 className="text-sm font-medium mb-2">Générer un nouveau lien</h3>
        <Form
          form={linkForm}
          onSubmit={(values) => generateLinkMutation.mutate(values)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RoleSelector control={linkForm.control} name="role" />

            <FormField
              control={linkForm.control}
              name="expiresIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expire après</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Expiration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPIRATION_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={linkForm.control}
              name="maxUses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utilisations max</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nb. utilisations" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MAX_USES_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <LoadingButton 
            loading={generateLinkMutation.isPending} 
            type="submit" 
            className="w-full sm:w-auto mx-auto"
          >
            Générer un lien d'invitation
          </LoadingButton>
        </Form>
      </section>

      {/* Liens d'invitation actifs */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Liens d'invitation actifs</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => void refetch()} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
        {isLoading && displayLinks.length === 0 ? (
          <div className="p-6 text-center">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Chargement des liens...</p>
          </div>
        ) : displayLinks.length === 0 ? (
          <div className="border rounded-md p-6 text-center">
            <p className="text-sm text-muted-foreground">Aucun lien d'invitation trouvé</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
            {displayLinks.map((link) => (
              <div 
                key={link.displayId} 
                className={cn(
                  "rounded-lg border p-4 flex flex-col gap-2 bg-background",
                  link.optimistic ? "bg-gray-50" : ""
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge isActive={link.isActive} isOptimistic={link.optimistic} />
                    <RoleBadge role={link.role} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatExpiration(link.expiresAt)}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    className="bg-muted px-2 py-1 rounded w-full text-xs truncate cursor-pointer border border-input"
                    value={link.url}
                    readOnly
                    onClick={async () => copyToClipboard(link.url)}
                    title="Cliquer pour copier le lien"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="flex-shrink-0"
                    onClick={() => void copyToClipboard(link.url)}
                  >
                    <CopyIcon 
                      className={cn(
                        "h-4 w-4", 
                        copySuccess === link.url ? "text-green-500" : ""
                      )} 
                    />
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
                  <div className="text-xs text-muted-foreground">
                    {link.uses} {link.maxUses ? `/ ${link.maxUses}` : ''} utilisations
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`active-${link.id}`}
                        checked={link.isActive}
                        disabled={link.optimistic}
                        onCheckedChange={() => {
                          if (!link.optimistic) {
                            void toggleLinkActiveMutation.mutate({ 
                              linkId: link.id, 
                              currentState: link.isActive 
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`active-${link.id}`} className="text-xs">
                        {link.isActive ? "Activé" : "Désactivé"}
                      </Label>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex-shrink-0"
                      disabled={link.optimistic}
                      onClick={() => {
                        if (!link.optimistic) {
                          void regenerateLinkMutation.mutate(link.id);
                        }
                      }}
                      title="Régénérer le lien"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex-shrink-0 text-red-500 hover:text-red-600"
                      disabled={link.optimistic}
                      onClick={() => {
                        if (!link.optimistic) {
                          void deleteLinkMutation.mutate(link.id);
                        }
                      }}
                      title="Supprimer le lien"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Crée un lien d'invitation avec des valeurs optimistiques
const createOptimisticLink = (
  values: LinkSchemaType, 
  orgSlug: string
): InviteLink => {
  // Générer un ID temporaire et un code temporaire
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const tempCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Convertir maxUses en nombre ou null
  let maxUsesValue: number | null = null;
  if (values.maxUses !== "unlimited") {
    maxUsesValue = parseInt(values.maxUses);
  }
  
  // Calculer la date d'expiration
  let expiresAt: string | null = null;
  if (values.expiresIn !== "never") {
    const expDate = new Date();
    const unit = values.expiresIn.slice(-1);
    const value = parseInt(values.expiresIn);
    
    if (unit === "h") {
      expDate.setHours(expDate.getHours() + value);
    } else if (unit === "d") {
      expDate.setDate(expDate.getDate() + value);
    }
    
    expiresAt = expDate.toISOString();
  }
  
  // Construire l'URL optimistique
  const optimisticUrl = `${window.location.origin}/servers/${orgSlug}/public/invite/${tempCode}`;
  
  return {
    id: tempId,
    code: tempCode,
    url: optimisticUrl,
    role: values.role,
    uses: 0,
    maxUses: maxUsesValue,
    expiresAt: expiresAt,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdById: null,
    createdByName: null,
    organizationId: "",
    organization: { 
      slug: orgSlug,
      name: "",
      logo: null 
    },
    displayId: tempId,
    optimistic: true // Marquer comme optimistique pour le style visuel
  };
};