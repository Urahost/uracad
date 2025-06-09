"use client";

import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { getOrganizationMembers } from "./actions";
import { Check, Search, User, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
};

type MemberSelectorProps = {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMember: (member: Member) => void;
};

export function MemberSelector({ 
  organizationId, 
  open, 
  onOpenChange, 
  onSelectMember 
}: MemberSelectorProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const hasLoaded = useRef(false);

  // Charger les membres lorsque la modal s'ouvre
  useEffect(() => {
    const loadMembers = async () => {
      if (!open || hasLoaded.current) return;
      
      setIsLoading(true);
      setError(false);
      
      try {
        const response = await getOrganizationMembers({ organizationId });
        
        // Vérification de la structure de la réponse
        if (response && typeof response === 'object') {
          // Soit la réponse est directement un tableau
          if (Array.isArray(response)) {
            setMembers(response);
            setFilteredMembers(response);
            hasLoaded.current = true;
          } 
          // Soit la réponse est un objet avec une propriété data
          else if ('data' in response && Array.isArray(response.data)) {
            setMembers(response.data);
            setFilteredMembers(response.data);
            hasLoaded.current = true;
          }
          // Soit la réponse est un objet vide ou sans membres
          else {
            logger.info('No members found or empty response:', response);
            setMembers([]);
            setFilteredMembers([]);
            hasLoaded.current = true;
          }
        } else {
          logger.error('Invalid response format:', response);
          setError(true);
        }
      } catch (err) {
        logger.error('Error fetching members:', err);
        setError(true);
        toast.error("Impossible de charger les membres");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMembers();
    
    // Réinitialiser le statut de chargement quand le modal se ferme
    return () => {
      if (!open) {
        hasLoaded.current = false;
      }
    };
  }, [open, organizationId]);

  // Rechargement manuel des membres
  const reloadMembers = async () => {
    setIsLoading(true);
    setError(false);
    
    try {
      const response = await getOrganizationMembers({ organizationId });
      
      // Vérification de la structure de la réponse
      if (response && typeof response === 'object') {
        // Soit la réponse est directement un tableau
        if (Array.isArray(response)) {
          setMembers(response);
          setFilteredMembers(response);
        } 
        // Soit la réponse est un objet avec une propriété data
        else if ('data' in response && Array.isArray(response.data)) {
          setMembers(response.data);
          setFilteredMembers(response.data);
        }
        // Soit la réponse est un objet vide ou sans membres
        else {
          logger.info('No members found or empty response:', response);
          setMembers([]);
          setFilteredMembers([]);
        }
      } else {
        logger.error('Invalid response format:', response);
        setError(true);
      }
    } catch (err) {
      logger.error('Error reloading members:', err);
      setError(true);
      toast.error("Impossible de charger les membres");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les membres en fonction de la recherche
  useEffect(() => {
    if (!searchQuery.trim() || !members.length) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter(
      member => 
        member.name.toLowerCase().includes(query) || 
        member.email.toLowerCase().includes(query)
    );
    
    setFilteredMembers(filtered);
  }, [searchQuery, members]);

  const handleSelectMember = (member: Member) => {
    onSelectMember(member);
    onOpenChange(false);
  };

  // MemberItem component
  const MemberItem = ({ member }: { member: Member }) => (
    <Button
      key={member.id}
      variant="ghost"
      className="w-full justify-start px-2 py-1 h-auto"
      onClick={() => handleSelectMember(member)}
    >
      <div className="flex items-center w-full gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.image ?? ""} alt={member.name} />
          <AvatarFallback>
            {member.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
        <Check className="h-4 w-4 opacity-0 group-hover:opacity-100" />
      </div>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner un membre</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un membre..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-72 rounded-md border p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Chargement des membres...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500 py-8">
                <p>Erreur lors du chargement des membres</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={reloadMembers}
                >
                  Réessayer
                </Button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                <User className="h-10 w-10 mb-2" />
                <p>Aucun membre trouvé</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMembers.map((member) => (
                  <MemberItem key={member.id} member={member} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 