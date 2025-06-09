"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RoleCard } from "./role-card";
import { type SortableRoleCardProps } from "./types";

/**
 * Composant permettant de rendre un RoleCard triable par glisser-déposer
 */
export function SortableRoleCard({ role, onEdit, onDelete }: SortableRoleCardProps) {
  // Configuration pour le drag & drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: role.id });
  
  // Styles pour l'animation de déplacement
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="mb-4 cursor-move"
    >
      <RoleCard role={role} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
} 