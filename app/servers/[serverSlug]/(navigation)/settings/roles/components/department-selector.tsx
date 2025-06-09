"use client";

import { startTransition, useState } from "react";
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createDepartmentServerAction, deleteDepartmentServerAction, getDepartmentsServerAction } from "../role-actions";


type DepartmentSelectorProps = {
  serverId: string;
  value?: string | null;
  onChange: (value: string | null) => void;
};

export function DepartmentSelector({ serverId, value, onChange }: DepartmentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [departmentToDelete, setDepartmentToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Utiliser useQuery pour gérer le cache et le rechargement automatique
  const { data: departments = [], refetch, isLoading } = useQuery({
    queryKey: ["departments", serverId],
    queryFn: async () => {
      return getDepartmentsServerAction({ serverId });
    },
    enabled: Boolean(serverId),
    staleTime: 0, // Toujours recharger les données
  });

  // Trouver le département correspondant à l'ID sélectionné
  const selectedDepartment = departments.find((dept) => dept.id === value);

  const handleSelect = async (currentValue: string) => {
    if (currentValue === "create-new") {
      if (!inputValue.trim()) {
        toast.error("Veuillez entrer un nom de département");
        return;
      }

      // Vérifier si le département existe déjà
      const existingDept = departments.find(
        (dept) => dept.name.toLowerCase() === inputValue.trim().toLowerCase()
      );

      if (existingDept) {
        toast.error("Ce département existe déjà");
        return;
      }

      createDepartmentMutation.mutate(inputValue.trim());
    } else if (currentValue === "clear") {
      // Option pour effacer la sélection
      onChange(null);
      setOpen(false);
    } else {
      // Trouver le département par son ID
      const department = departments.find((dept) => dept.id === currentValue);
      
      if (department) {
        // Vérifier si c'est déjà le département sélectionné
        if (department.id === value) {
          setOpen(false);
          return;
        }
        
        onChange(department.id);
        setOpen(false);
      }
    }
  };

  // Mutation pour créer un nouveau département
  const createDepartmentMutation = useMutation({
    mutationFn: async (name: string) => {
      return createDepartmentServerAction({ name });
    },
    onSuccess: (data) => {
      onChange(data.id);
      toast.success("Département créé avec succès");
      void refetch();
      setOpen(false);
      setInputValue("");
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour supprimer un département
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (departmentId: string) => {
      return deleteDepartmentServerAction({ departmentId });
    },
    onSuccess: () => {
      toast.success("Département supprimé avec succès");
      
      // Si le département supprimé était sélectionné, réinitialiser la sélection
      if (departmentToDelete && departmentToDelete.id === value) {
        onChange(null);
      }
      
      // Fermer la boîte de dialogue et réinitialiser l'état
      setIsDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      
      // Ajouter un délai pour que le toast soit visible avant le rechargement
      startTransition(() => {
        void refetch();
        window.location.reload();
      });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
      setIsDeleteDialogOpen(false);
    },
  });

  // Gérer le clic droit sur un département pour le supprimer
  const handleDeleteDepartment = (departmentId: string, departmentName: string) => {
    setDepartmentToDelete({ id: departmentId, name: departmentName });
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading 
              ? "Chargement..." 
              : (selectedDepartment
                  ? selectedDepartment.name
                  : "Sélectionner un département")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Rechercher un département..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty className="py-2 px-4 text-sm">
              {inputValue.trim() && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => void handleSelect("create-new")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer "{inputValue.trim()}"
                </Button>
              )}
              {!inputValue.trim() && (
                <div className="text-center text-muted-foreground">
                  Aucun département trouvé
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {/* Option pour aucun département */}
              <CommandItem
                value="clear"
                onSelect={() => void handleSelect("clear")}
                className={cn(
                  value === null && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === null ? "opacity-100" : "opacity-0"
                  )}
                />
                Aucun département
              </CommandItem>
              
              {isLoading ? (
                <CommandItem disabled>Chargement...</CommandItem>
              ) : departments.length === 0 ? (
                <CommandItem disabled>Aucun département disponible</CommandItem>
              ) : (
                departments.map((dept) => (
                  <ContextMenu key={dept.id}>
                    <ContextMenuTrigger>
                      <CommandItem
                        value={dept.id}
                        onSelect={() => void handleSelect(dept.id)}
                        className={cn(
                          value === dept.id && "bg-accent",
                          "cursor-pointer relative"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === dept.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {dept.name}
                      </CommandItem>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        className="text-destructive focus:text-destructive-foreground focus:bg-destructive/20"
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Boîte de dialogue de confirmation pour la suppression */}
      <AlertDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer ce département ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les rôles qui utilisent ce département
              perdront cette association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDepartmentToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (departmentToDelete) {
                  deleteDepartmentMutation.mutate(departmentToDelete.id);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 