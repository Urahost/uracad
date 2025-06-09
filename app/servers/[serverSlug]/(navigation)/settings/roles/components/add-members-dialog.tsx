"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getServerMembersAction, addMembersToRoleAction } from "../role-actions";

type Member = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type AddMembersDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string | null;
  roleName: string;
}

export function AddMembersDialog({ isOpen, onOpenChange, roleId, roleName }: AddMembersDialogProps) {
  const [searchMember, setSearchMember] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);
  
  // Récupérer les membres du serveur (sans auto-chargement)
  const getMembersMutation = useMutation({
    mutationFn: async ({ query, roleId }: { query?: string; roleId?: string }) => {
      return resolveActionResult(getServerMembersAction({ query, roleId }));
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
    onSuccess: (data) => {
      setMembers(data);
      setIsFirstLoaded(true);
    },
  });

  // Ajouter des membres au rôle
  const addMembersMutation = useMutation({
    mutationFn: async ({ roleId, memberIds }: { roleId: string; memberIds: string[] }) => {
      return resolveActionResult(addMembersToRoleAction({ roleId, memberIds }));
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
    onSuccess: (data) => {
      toast.success(`${data.count} membre(s) ajouté(s) au rôle avec succès`);
      
      // Fermer directement, pas besoin de setTimeout
      onOpenChange(false);
    },
  });

  // Charger les membres (manuellement)
  const loadMembers = () => {
    if (roleId && !getMembersMutation.isPending) {
      getMembersMutation.mutate({ 
        query: searchMember.trim() || undefined, 
        roleId 
      });
    }
  };

  // Fonction manuelle pour gérer la recherche
  const handleSearch = () => {
    loadMembers();
  };

  // Réinitialiser tout
  const resetState = () => {
    setSelectedMemberIds([]);
    setSearchMember("");
    setMembers([]);
    setIsFirstLoaded(false);
  };

  // Ajouter ou retirer un membre de la sélection
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  // Gérer l'ajout des membres sélectionnés au rôle
  const handleAddMembersToRole = () => {
    if (!selectedMemberIds.length || !roleId) return;
    
    addMembersMutation.mutate({ roleId, memberIds: selectedMemberIds });
  };

  const isLoading = getMembersMutation.isPending;
  const isAddingMembers = addMembersMutation.isPending;

  // Interface utilisateur conditionnelle
  let membersContent;
  
  if (isLoading) {
    membersContent = (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Chargement des membres...</p>
      </div>
    );
  } else if (!isFirstLoaded) {
    membersContent = (
      <div className="flex flex-col items-center justify-center py-8 space-y-2">
        <p className="text-muted-foreground">Cliquez sur le bouton pour charger les membres</p>
        <Button onClick={loadMembers} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Charger les membres
        </Button>
      </div>
    );
  } else if (members.length === 0) {
    membersContent = (
      <div className="text-center py-8 text-muted-foreground">
        {searchMember.trim() 
          ? "Aucun membre ne correspond à votre recherche." 
          : "Aucun membre disponible à ajouter. Tous les utilisateurs sont déjà assignés ou vous n'avez pas encore ajouté de membres à votre serveur."}
      </div>
    );
  } else {
    membersContent = (
      <div className="space-y-1">
        {members.map(member => (
          <div 
            key={member.id}
            className="flex items-center space-x-3 py-2 px-3 hover:bg-muted/60 rounded cursor-pointer"
            onClick={() => toggleMemberSelection(member.id)}
          >
            <Checkbox 
              checked={selectedMemberIds.includes(member.id)}
              onCheckedChange={() => toggleMemberSelection(member.id)}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium">{member.name}</div>
              <div className="text-xs text-muted-foreground truncate">{member.email}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!addMembersMutation.isPending) {
          onOpenChange(open);
          if (!open) {
            resetState();
          } else if (!isFirstLoaded) {
            // Charger automatiquement la première fois que la modal s'ouvre
            loadMembers();
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter des membres au rôle</DialogTitle>
          <DialogDescription>
            Sélectionnez les membres que vous souhaitez ajouter au rôle {roleName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 bg-muted/50"
                placeholder="Rechercher par nom ou email" 
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleSearch}
              disabled={isLoading || !roleId}
            >
              Rechercher
            </Button>
          </div>
          <div className="max-h-[280px] overflow-y-auto border rounded-md p-1">
            {membersContent}
          </div>
          {selectedMemberIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedMemberIds.length} membre(s) sélectionné(s)
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={addMembersMutation.isPending}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleAddMembersToRole}
            disabled={selectedMemberIds.length === 0 || isAddingMembers || !roleId}
          >
            {isAddingMembers ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>Ajouter</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 