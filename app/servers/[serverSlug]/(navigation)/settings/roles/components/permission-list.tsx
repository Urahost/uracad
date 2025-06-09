"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, CheckSquare, CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { getPermissionDescription, permissionCategories } from "../permissions-data";


type PermissionListProps = {
  selectedPermissions: Record<string, boolean>;
  onChange: (permissionId: string, checked: boolean, bulkUpdate?: Record<string, boolean>) => void;
};

export function PermissionList({ 
  selectedPermissions, 
  onChange, 
}: PermissionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations("Permissions");
  
  // Check if all permissions are selected
  const areAllPermissionsSelected = () => {
    // Get all permission IDs from categories
    const allPermissionIds = permissionCategories.flatMap(category => 
      category.permissions.map(permission => permission.id)
    );
    
    // Check if all permissions exist and are true in selectedPermissions
    return allPermissionIds.length > 0 && 
           allPermissionIds.every(id => selectedPermissions[id] === true);
  };

  // Toggle all permissions
  const handleToggleAll = () => {
    const newValue = !areAllPermissionsSelected();
    
    // Créer un nouvel objet avec toutes les permissions
    const updatedPermissions = permissionCategories.reduce((acc, category) => {
      category.permissions.forEach(permission => {
        acc[permission.id] = newValue;
      });
      return acc;
    }, {} as Record<string, boolean>);
    
    // Appeler onChange avec l'objet complet des permissions
    onChange("__all__", newValue, updatedPermissions);
  };

  // Filter categories based on search
  const filteredCategories = permissionCategories.map(category => ({
    ...category,
    permissions: category.permissions.filter(permission => 
      searchTerm.trim() === "" || 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPermissionDescription(permission.id, t).toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.permissions.length > 0);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search permissions..."
          className="w-full bg-background pl-8 focus-visible:ring-0 border-muted"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Clear</span>
          </button>
        )}
      </div>
      
      {/* Toggle all button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex items-center"
        onClick={handleToggleAll}
      >
        <CheckSquare className="mr-2 h-4 w-4" />
        {areAllPermissionsSelected() ? 'Unselect All' : 'Select All'}
      </Button>
      
      {filteredCategories.map(category => (
        <div key={category.id} className="space-y-1">
          <h3 className="text-base font-semibold mb-2">
            {t.has(`categories.${category.id}`) ? t(`categories.${category.id}`) : category.name}
          </h3>
          
          <div className="space-y-0">
            {category.permissions.map(permission => (
              <div 
                key={permission.id} 
                className="flex items-start justify-between py-3 px-2 hover:bg-muted/60 rounded transition-colors cursor-pointer"
                onClick={() => {
                  const newValue = !selectedPermissions[permission.id];
                  onChange(permission.id, newValue);
                }}
              >
                <div className="space-y-1 flex-1 pr-4">
                  <p className="text-sm font-medium">
                    {t.has(`names.${permission.id}`) ? t(`names.${permission.id}`) : permission.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getPermissionDescription(permission.id, t)}
                  </p>
                </div>
                
                <div 
                  className={`w-6 h-6 flex items-center justify-center rounded cursor-pointer ${
                    selectedPermissions[permission.id] ? 'bg-blue-500' : 'bg-zinc-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newValue = !selectedPermissions[permission.id];
                    onChange(permission.id, newValue);
                  }}
                >
                  {selectedPermissions[permission.id] && (
                    <CheckIcon className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 