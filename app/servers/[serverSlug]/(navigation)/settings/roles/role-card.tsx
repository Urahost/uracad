"use client";

import { Button } from "@/components/ui/button";
import { type RoleCardProps } from "./types";
import { useTranslations } from "next-intl";

/**
 * Composant pour afficher un rôle existant avec style Discord
 */
export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  const t = useTranslations("Roles");
  
  // Convertir les permissions stockées en JSON en objet si nécessaire
  
  return (
    <div className="group flex items-center py-3 px-2 hover:bg-black/5 rounded transition-colors relative">
      {/* Pastille de couleur */}
      <div 
        className="w-3 h-3 rounded-full mr-3"
        style={{ backgroundColor: role.color ?? '#99aab5' }}
      />
      
      {/* Nom du rôle */}
      <div className="font-medium text-sm flex-grow">
        {role.name}
      </div>
      
      {/* Description tronquée (si présente) */}
      {role.description && (
        <div className="text-xs text-muted-foreground max-w-[200px] truncate hidden sm:block">
          {role.description}
        </div>
      )}
    
      
      {/* Boutons d'action (visibles au survol) */}
      <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 bg-zinc-700/50 hover:bg-zinc-700" 
          onClick={() => onEdit(role.id)}
          aria-label={t("editRole")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
          </svg>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 bg-red-900/30 hover:bg-red-900/60 text-red-400" 
          onClick={() => onDelete(role.id)}
          aria-label={t("deleteRole")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
} 