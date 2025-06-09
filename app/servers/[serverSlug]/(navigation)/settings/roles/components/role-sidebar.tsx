"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { type Role } from "../types";

// Props pour l'élément de la barre latérale
type RoleSidebarItemProps = {
  role: Role;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
};

// Composant pour un élément de rôle dans la barre latérale
function RoleSidebarItem({
  role,
  isSelected,
  onClick,
  onDelete,
}: RoleSidebarItemProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`flex cursor-pointer items-center rounded py-2 pr-3 pl-2 ${
            isSelected ? "bg-accent" : "hover:bg-accent/50"
          }`}
          onClick={onClick}
        >
          <div className="truncate text-sm font-medium">{role.name}</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {onDelete && role.id !== "temp-new-role" && (
          <ContextMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Props pour le composant principal
type RoleSidebarProps = {
  roles: Role[];
  selectedRoleId: string | null;
  isCreatingRole: boolean;
  onSelectRole: (roleId: string) => void;
  onCreateRole: () => void;
  onDeleteRole: (roleId: string) => void;
};

// Composant principal de la barre latérale
export function RoleSidebar({
  roles,
  selectedRoleId,
  isCreatingRole,
  onSelectRole,
  onCreateRole,
  onDeleteRole,
}: RoleSidebarProps) {
  // Créer un rôle temporaire pour l'affichage pendant la création
  let displayRoles = roles;

  // Si on est en mode création, ajouter un rôle temporaire à la liste
  if (isCreatingRole) {
    const tempRole: Role = {
      id: "temp-new-role",
      name: "Nouveau rôle",
      description: "",
      color: "#99aab5",
      permissions: {},
      position: roles.length,
    };
    displayRoles = [...roles, tempRole];
  }

  return (
    <div className="bg-background flex w-56 flex-col border-r">
      <div className="border-b p-4 font-medium">Rôles du serveur</div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {displayRoles.map((role) => (
            <RoleSidebarItem
              key={role.id}
              role={role}
              isSelected={
                (isCreatingRole && role.id === "temp-new-role") ||
                (!isCreatingRole && role.id === selectedRoleId)
              }
              onClick={() => {
                if (role.id === "temp-new-role") {
                  // Déjà en mode création, ne rien faire
                  return;
                }
                onSelectRole(role.id);
              }}
              onDelete={
                role.id !== "temp-new-role"
                  ? () => onDeleteRole(role.id)
                  : undefined
              }
            />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-2">
        <Button className="w-full" onClick={onCreateRole}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau rôle
        </Button>
      </div>
    </div>
  );
}
