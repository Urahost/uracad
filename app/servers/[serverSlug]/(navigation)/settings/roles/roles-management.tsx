"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { type Role } from "./types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
import { AddMembersDialog } from "./components/add-members-dialog";
import { RoleSidebar } from "./components/role-sidebar";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { PermissionList } from "./components/permission-list";
import { RoleMembers } from "./components/role-members";
import { DepartmentSelector } from "./components/department-selector";
import {
  createRoleServerAction,
  deleteRoleServerAction,
  updateRoleServerAction,
} from "./role-actions";
import { logger } from "@/lib/logger";

// Composant principal de gestion des rôles
export function RolesManagement({
  roles = [],
  serverId: _serverId,
}: {
  roles: Role[];
  serverId: string;
}) {
  // État de transition React
  const [isPending, startTransition] = useTransition();

  // Router pour le rafraîchissement
  const router = useRouter();

  // États principaux
  const [localRoles, setLocalRoles] = useState<Role[]>(roles);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    roles.length > 0 ? roles[0].id : null,
  );
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // États pour l'édition
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, boolean>
  >({});
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);

  // États pour les dialogues
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [membersCount, setMembersCount] = useState(0);

  // Rôle sélectionné
  const selectedRole = useMemo(() => {
    if (isCreatingRole) {
      return {
        id: "temp-new-role",
        name: roleName || "Nouveau rôle",
        permissions: selectedPermissions,
        position: localRoles.length,
        departmentId: selectedDepartmentId,
      };
    }
    return localRoles.find((role) => role.id === selectedRoleId) ?? null;
  }, [
    isCreatingRole,
    roleName,
    selectedPermissions,
    localRoles,
    selectedRoleId,
    selectedDepartmentId,
  ]);

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: {
      name: string;
      color: string;
      permissions: Record<string, boolean>;
      departmentId?: string | null;
    }) => createRoleServerAction(roleData),
    onSuccess: (data) => {
      const newRole = {
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        color: data.color ?? null,
        permissions: data.permissions ? JSON.parse(data.permissions) : [],
        position: data.position,
      } as Role;

      toast.success(`Le rôle "${data.name}" a été créé avec succès.`);
      setLocalRoles((prev) => [...prev, newRole]);
      setSelectedRoleId(data.id);
      setIsCreatingRole(false);

      // Rafraîchir l'UI
      startTransition(() => {
        router.refresh();
      });
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      roleId,
      ...roleData
    }: {
      roleId: string;
      name: string;
      color: string;
      permissions: Record<string, boolean>;
      departmentId?: string | null;
    }) => updateRoleServerAction({ roleId, ...roleData }),
    onSuccess: (data) => {
      const updatedRole = {
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        color: data.color ?? null,
        permissions: data.permissions ? JSON.parse(data.permissions) : [],
        position: data.position,
        departmentId: data.departmentId ?? null,
      } as Role;

      toast.success(`Le rôle "${data.name}" a été mis à jour avec succès.`);
      setLocalRoles((prev) =>
        prev.map((role) => (role.id === data.id ? updatedRole : role)),
      );

      // Rafraîchir l'UI
      startTransition(() => {
        router.refresh();
      });
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => deleteRoleServerAction({ roleId }),
    onSuccess: () => {
      toast.success(`Le rôle a été supprimé avec succès.`);
      
      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      
      // Rafraîchir l'UI de façon optimisée sans reload complet
      startTransition(() => {
        router.refresh();
      });
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  // Gestion du formulaire
  const resetForm = () => {
    setRoleName("");
    setSelectedPermissions({});
    setSelectedDepartmentId(null);
  };

  const updateRoleStates = (role: Role) => {
    setRoleName(role.name || "");
    setSelectedDepartmentId(role.departmentId ?? null);

    // Analyser les permissions
    let permissionsObject: Record<string, boolean> = {};

    try {
      const permissionsData =
        typeof role.permissions === "string"
          ? JSON.parse(role.permissions)
          : role.permissions;

      if (Array.isArray(permissionsData)) {
        permissionsData.forEach((permId) => {
          permissionsObject[permId] = true;
        });
      } else if (typeof permissionsData === "object") {
        permissionsObject = permissionsData as Record<string, boolean>;
      }
    } catch (error) {
      logger.error("Error parsing permissions:", error);
    }

    setSelectedPermissions(permissionsObject);
  };

  // Effets
  useEffect(() => {
    if (selectedRole && !isCreatingRole) {
      updateRoleStates(selectedRole);
    }
  }, [selectedRoleId, localRoles, isCreatingRole, selectedRole]);

  // Handlers
  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error("Le nom du rôle est obligatoire");
      return;
    }

    const roleData = {
      name: roleName,
      color: "#99aab5", // Valeur par défaut pour le schema
      permissions: selectedPermissions,
      departmentId: selectedDepartmentId,
    };

    try {
      if (isCreatingRole) {
        await createRoleMutation.mutateAsync(roleData);
      } else if (selectedRoleId) {
        await updateRoleMutation.mutateAsync({
          ...roleData,
          roleId: selectedRoleId,
        });
      }
    } catch (error) {
      logger.error("Error saving role:", error);
    }
  };

  const handlePermissionChange = (
    permissionId: string,
    checked: boolean,
    bulkUpdate?: Record<string, boolean>,
  ) => {
    if (bulkUpdate && permissionId === "__all__") {
      setSelectedPermissions(bulkUpdate);
    } else {
      setSelectedPermissions((prev) => ({
        ...prev,
        [permissionId]: checked,
      }));
    }
  };

  const resetToNewRoleForm = () => {
    resetForm();
    setIsCreatingRole(true);
    setSelectedRoleId(null);
  };

  const handleDeleteRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsCreatingRole(false);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectRole = (roleId: string) => {
    setIsCreatingRole(false);
    setSelectedRoleId(roleId);
  };

  const isSaving = createRoleMutation.isPending || updateRoleMutation.isPending;
  const isDeleting = deleteRoleMutation.isPending;

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[500px] overflow-hidden rounded-md border">
      {/* Sidebar des rôles */}
      <RoleSidebar
        roles={localRoles}
        selectedRoleId={selectedRoleId}
        isCreatingRole={isCreatingRole}
        onSelectRole={handleSelectRole}
        onCreateRole={resetToNewRoleForm}
        onDeleteRole={handleDeleteRole}
      />

      {/* Panneau de gestion des rôles */}
      <div className="bg-background flex-1 overflow-auto">
        <div className="flex items-center justify-between border-b p-4">
          <h1 className="text-lg font-semibold">
            {isCreatingRole
              ? "Créer un nouveau rôle"
              : `Modifier le rôle — ${selectedRole?.name ?? ""}`}
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isSaving || isPending}>
              {isSaving || isPending
                ? "Enregistrement..."
                : isCreatingRole
                  ? "Créer"
                  : "Enregistrer"}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="display" className="w-full">
          <div className="border-b p-2">
            <TabsList className="bg-background h-10">
              <TabsTrigger className="cursor-pointer" value="display">
                Apparence
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="permissions">
                Permissions
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="department">
                Département
              </TabsTrigger>
              {!isCreatingRole && (
                <TabsTrigger className="cursor-pointer" value="members">
                  Membres
                  <Badge variant="outline">{membersCount}</Badge>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="display" className="p-4">
            <div className="space-y-6">
              {/* Nom du rôle */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  Nom du rôle
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  type="text"
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Nom du rôle"
                />
                <p className="text-muted-foreground text-xs">
                  Le nom apparaîtra dans la liste des membres et les mentions.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="p-4">
            <PermissionList
              selectedPermissions={selectedPermissions}
              onChange={handlePermissionChange}
            />
          </TabsContent>

          <TabsContent value="department" className="p-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  Département
                </label>
                <DepartmentSelector
                  serverId={_serverId}
                  value={selectedDepartmentId}
                  onChange={setSelectedDepartmentId}
                />
                <p className="text-muted-foreground text-xs">
                  Associez ce rôle à un département pour une meilleure
                  organisation.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="p-4">
            <RoleMembers
              roleId={selectedRoleId}
              roleName={selectedRole?.name ?? ""}
              onMembersCountChange={setMembersCount}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Boîte de dialogue de confirmation pour la suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer ce rôle ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les membres qui avaient ce rôle
              perdront les permissions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || isPending}
              onClick={() => {
                if (selectedRoleId) {
                  deleteRoleMutation.mutate(selectedRoleId);
                }
              }}
            >
              {isDeleting || isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog pour ajouter des membres */}
      <AddMembersDialog
        isOpen={isAddMembersDialogOpen}
        onOpenChange={setIsAddMembersDialogOpen}
        roleId={selectedRoleId}
        roleName={selectedRole?.name ?? ""}
      />
    </div>
  );
}
