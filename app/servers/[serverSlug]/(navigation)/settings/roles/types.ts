import { type UseFormReturn } from "react-hook-form";


/**
 * Type pour un rôle personnalisé comme retourné par l'API
 */
export type CustomRole = {
  id: string;
  name: string;
  description?: string;
  permissions: string; // Format JSON stocké en base de données
  color?: string;
  position: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Propriétés pour le composant de gestion des rôles
 */
export type CustomRolesManagerProps = {
  serverId: string;
  existingRoles: Role[];
};

/**
 * Propriétés du composant pour afficher un rôle
 */
export type RoleCardProps = {
  role: Role;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

/**
 * Propriétés pour le composant de rôle triable
 */
export type SortableRoleCardProps = {
  role: Role;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder?: (id: string, newPosition: number) => void;
};

/**
 * Propriétés pour le composant de sélection de permission
 */
export type PermissionCheckboxProps = {
  permission: Permission;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>; // Generic form type to work with different schemas
};

/**
 * Type pour un rôle tel qu'utilisé dans l'application
 */
export type Role = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  permissions: string[] | Record<string, boolean>;
  position: number;
  departmentId?: string | null;
};

/**
 * Interface pour une catégorie de permissions
 */
export type PermissionCategory = {
  id: string;
  name: string;
  permissions: Permission[];
}

/**
 * Interface pour une permission
 */
export type Permission = {
  id: string;
  name: string;
} 