"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { type PermissionCheckboxProps } from "./types";

/**
 * Composant pour afficher une case à cocher de permission
 */
export function PermissionCheckbox({ permission, form }: PermissionCheckboxProps) {
  const fieldName = `permissions.${permission.id}`;
  
  // Gestion du changement d'état de la case à cocher
  const handleChange = (checked: boolean) => {
    // Récupérer les permissions actuelles
    const currentPermissions = form.getValues("permissions");
    
    // Si c'est un tableau, ajouter ou supprimer l'ID selon l'état
    if (Array.isArray(currentPermissions)) {
      const newPermissions = checked
        ? [...currentPermissions, permission.id]
        : currentPermissions.filter(id => id !== permission.id);
      
      form.setValue("permissions", newPermissions);
    } 
    // Si c'est un objet, mettre à jour la valeur booléenne
    else {
      form.setValue(fieldName, checked);
    }
  };
  
  // Vérifier si cette permission est déjà cochée
  const isChecked = () => {
    const permissions = form.getValues("permissions");
    
    if (Array.isArray(permissions)) {
      return permissions.includes(permission.id);
    }
    
    return form.watch(fieldName) ?? false;
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={permission.id} 
        checked={isChecked()}
        onCheckedChange={handleChange}
      />
      <label
        htmlFor={permission.id}
        className="text-sm capitalize cursor-pointer"
      >
        {permission.name}
      </label>
    </div>
  );
} 