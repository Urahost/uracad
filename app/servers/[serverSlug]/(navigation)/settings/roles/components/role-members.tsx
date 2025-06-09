"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { AddMembersDialog } from "./add-members-dialog";
import { getRoleMembersAction, removeMemberFromRoleAction } from "../role-actions";
import { Skeleton } from "@/components/ui/skeleton";

type RoleMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  dateAdded?: Date;
};

type RoleMembersProps = {
  roleId: string | null;
  roleName: string;
  onMembersCountChange?: (count: number) => void;
};

export function RoleMembers({ roleId, roleName, onMembersCountChange }: RoleMembersProps) {
  const [members, setMembers] = useState<RoleMember[]>([]);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  // Ajouter une référence pour suivre la dernière requête 
  const lastLoadTimestamp = useRef<number>(0);
  const lastRoleId = useRef<string | null>(null);
  const loadingInProgress = useRef<boolean>(false);

  // Charger les membres
  const loadMembers = useCallback(async (force = false) => {
    if (!roleId) return;
    
    // Éviter les requêtes multiples rapprochées pour le même rôle
    const now = Date.now();
    const minTimeBetweenLoads = 1000; // 1 seconde entre les chargements
    
    // Si une requête est déjà en cours, on l'ignore
    if (loadingInProgress.current) return;
    
    // Si ce n'est pas forcé, et qu'on charge le même rôle récemment, ignorer
    if (!force && 
        roleId === lastRoleId.current && 
        now - lastLoadTimestamp.current < minTimeBetweenLoads) {
      return;
    }
    
    setIsLoadingMembers(true);
    loadingInProgress.current = true;
    lastRoleId.current = roleId;
    lastLoadTimestamp.current = now;
    
    try {
      const data = await resolveActionResult(getRoleMembersAction({ roleId }));
      setMembers(data);
      
      // Mettre à jour le compteur si nécessaire
      if (onMembersCountChange) {
        onMembersCountChange(data.length);
      }
    } catch (error) {
      toast.error(`Erreur lors du chargement des membres: ${error instanceof Error ? error.message : "inconnu"}`);
    } finally {
      setIsLoadingMembers(false);
      loadingInProgress.current = false;
    }
  }, [roleId, onMembersCountChange]);

  // Charger les membres au montage et lors du changement de rôle
  useEffect(() => {
    if (roleId && roleId !== lastRoleId.current) {
      void loadMembers(true); // Forcer le chargement sur changement de rôle
    }
  }, [roleId, loadMembers]);

  // Mutation pour supprimer un membre
  const removeMemberMutation = useMutation({
    mutationFn: async ({ memberId, roleId }: { memberId: string; roleId: string }) => {
      return resolveActionResult(removeMemberFromRoleAction({ memberId, roleId }));
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Membre retiré du rôle avec succès");
      
      // Recharger manuellement après suppression avec un petit délai
      // pour laisser le temps à la base de données de se mettre à jour
      setTimeout(() => {
        void loadMembers(true); // Forcer le rechargement avec void pour ignorer la promesse
        
        // Rafraîchir aussi la page complète pour mettre à jour tous les composants
        // y compris le cache des membres disponibles à ajouter
        window.location.reload();
      }, 500); // Augmenter légèrement le délai pour s'assurer que le toast est visible
    }
  });

  // Appeler loadMembers après avoir fermé le dialog d'ajout de membres
  const handleAddMembersDialogClose = (open: boolean) => {
    setIsAddMembersDialogOpen(open);
    
    // Si le dialog se ferme, recharger les membres
    if (!open && roleId) {
      // Attendre un court instant pour éviter les problèmes de rendu
      // Utiliser un délai plus long pour s'assurer que le dialogue est bien fermé
      // et que la mutation a eu le temps de se terminer
      setTimeout(() => {
        void loadMembers(true); // Forcer le rechargement
      }, 500);
    }
  };

  // Gérer la suppression d'un membre du rôle
  const handleRemoveMember = (memberId: string) => {
    setMemberToRemove(memberId);
    setIsRemoveMemberDialogOpen(true);
  };

  // Confirmer la suppression du membre
  const confirmRemoveMember = () => {
    if (!roleId || !memberToRemove) return;
    
    removeMemberMutation.mutate({ 
      memberId: memberToRemove, 
      roleId: roleId 
    });
    
    setIsRemoveMemberDialogOpen(false);
    setMemberToRemove(null);
  };

  // Ajouter un composant MemberSkeleton pour l'affichage pendant le chargement
  const MemberSkeleton = () => (
    <div className="flex items-center p-2 rounded-md justify-between animate-pulse">
      <div className="flex items-center">
        <Skeleton className="h-8 w-8 rounded-full mr-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );

  // Dans le return, remplacer la liste complète par une liste optimisée
  // Limiter l'affichage initial à 20 membres et montrer un bouton "Voir plus" si nécessaire
  const displayedMembers = useMemo(() => {
    const initialLimit = 20;
    if (members.length <= initialLimit) return members;
    return showAllMembers ? members : members.slice(0, initialLimit);
  }, [members, showAllMembers]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/40 py-4 px-6 border-b">
        <h2 className="text-lg font-semibold">Membres avec ce rôle</h2>
        <p className="text-sm text-muted-foreground">
          Gérez les membres qui ont le rôle {roleName}
        </p>
      </div>
      <div className="p-6">
        {isLoadingMembers ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, index) => (
              <MemberSkeleton key={index} />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            Aucun membre n'a ce rôle actuellement.
          </div>
        ) : (
          <div className="space-y-2">
            {displayedMembers.map(member => (
              <div key={member.id} className="flex items-center p-2 hover:bg-muted/50 rounded-md justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-4">
                    <AvatarImage src={member.image ?? ""} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {members.length > 20 && !showAllMembers && (
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => setShowAllMembers(true)}
              >
                Voir {members.length - 20} membres supplémentaires
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="border-t bg-muted/20 py-3 px-6 flex justify-end">
        <Button 
          variant="outline"
          onClick={() => setIsAddMembersDialogOpen(true)}
          className="flex items-center gap-2"
          disabled={!roleId}
        >
          <UserPlus className="h-4 w-4" />
          Ajouter des membres
        </Button>
      </div>

      {/* Dialog pour ajouter des membres */}
      <AddMembersDialog
        isOpen={isAddMembersDialogOpen}
        onOpenChange={handleAddMembersDialogClose}
        roleId={roleId}
        roleName={roleName}
      />
      
      {/* Dialog pour confirmer la suppression d'un membre */}
      <AlertDialog open={isRemoveMemberDialogOpen} onOpenChange={setIsRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce membre du rôle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le membre perdra les permissions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRemoveMember}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 