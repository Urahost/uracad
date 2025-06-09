"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { resolveActionResult } from "@/lib/actions/actions-utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";

import { permissionCategories } from "./permissions-data";
import { RoleSchema, type RoleSchemaType } from "./schema";
import { PermissionCheckbox } from "./permission-checkbox";
import { RoleCard } from "./role-card";
import type { CustomRolesManagerProps, Role } from "./types";
import { createRoleAction, updateRoleAction, deleteRoleAction } from "./role-actions";

export function CustomRolesManager({ existingRoles = [] }: CustomRolesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>(existingRoles);

  // Utiliser useZodForm comme dans server-details-form.tsx
  const form = useZodForm({
    schema: RoleSchema,
    defaultValues: {
      name: "",
      description: "",
      color: "#7289da",
      permissions: [],
    },
  });

  // Mutation pour créer ou mettre à jour un rôle avec server action
  const { mutate: saveRole, isPending } = useMutation({
    mutationFn: async (data: RoleSchemaType) => {
      // Convert string[] to Record<string, boolean> for permissions
      const formattedData = {
        ...data,
        color: data.color ?? "#7289da", // Ensure color is never null
        permissions: Array.isArray(data.permissions) 
          ? data.permissions.reduce((acc, perm) => ({...acc, [perm]: true}), {})
          : data.permissions
      };
      
      if (editing) {
        return resolveActionResult(
          updateRoleAction({
            ...formattedData,
            roleId: editing,
          })
        );
      } else {
        return resolveActionResult(
          createRoleAction(formattedData)
        );
      }
    },
    onSuccess: (data) => {
      // Parse permissions if it's a string
      const parsedData = {
        ...data,
        permissions: typeof data.permissions === 'string' 
          ? JSON.parse(data.permissions) 
          : data.permissions
      };
      
      if (editing) {
        setRoles((prev) =>
          prev.map((role) => (role.id === editing ? parsedData as Role : role))
        );
        setEditing(null);
      } else {
        setRoles((prev) => [...prev, parsedData as Role]);
      }
      
      form.reset();
      setOpen(false);
      toast.success(
        editing ? "Rôle mis à jour avec succès" : "Rôle créé avec succès"
      );
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        editing
          ? `Erreur lors de la mise à jour du rôle: ${error.message}`
          : `Erreur lors de la création du rôle: ${error.message}`
      );
    },
  });

  // Mutation pour supprimer un rôle avec server action
  const { mutate: deleteRole } = useMutation({
    mutationFn: async (roleId: string) => {
      return resolveActionResult(
        deleteRoleAction({
          roleId,
        })
      );
    },
    onSuccess: (_, roleId) => {
      setRoles((prev) => prev.filter((role) => role.id !== roleId));
      toast.success("Rôle supprimé avec succès");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression du rôle: ${error.message}`);
    },
  });

  // Gestion de la modification d'un rôle
  const handleEdit = (id: string) => {
    const roleToEdit = roles.find((role) => role.id === id);
    if (!roleToEdit) return;

    form.reset({
      name: roleToEdit.name,
      description: roleToEdit.description ?? "",
      color: roleToEdit.color ?? "#7289da",
      permissions: Array.isArray(roleToEdit.permissions)
        ? roleToEdit.permissions
        : typeof roleToEdit.permissions === 'string'
          ? JSON.parse(roleToEdit.permissions)
          : roleToEdit.permissions,
    });

    setEditing(id);
    setOpen(true);
  };

  // Gestion de la fermeture de la boîte de dialogue
  const handleDialogClose = () => {
    form.reset();
    setEditing(null);
    setOpen(false);
  };

  // Dialog content avec structure identique à server-details-form.tsx
  const renderDialogContent = () => (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          {editing ? "Modifier le rôle" : "Créer un nouveau rôle"}
        </DialogTitle>
      </DialogHeader>
      
      <form 
        onSubmit={form.handleSubmit(async (values) => {
          await saveRole(values);
        })}
        className="flex w-full flex-col gap-6 lg:gap-8"
      >
        
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>
              Informations de base du rôle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Administrateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Accès complet au serveur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Définir les permissions accordées par ce rôle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <Accordion type="multiple" className="w-full">
                {permissionCategories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-sm font-semibold">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {category.permissions.map((permission) => (
                          <PermissionCheckbox
                            key={permission.id}
                            permission={permission}
                            form={form}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex items-end p-6">
          <Button
            type="button" 
            variant="outline" 
            onClick={handleDialogClose} 
            className="mr-2 w-fit"
          >
            Annuler
          </Button>
          <Button type="submit" className="w-fit" disabled={isPending}>
            {isPending ? "Chargement..." : editing ? "Mettre à jour" : "Créer"}
          </Button>
        </Card>
      </form>
    </DialogContent>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gestion des rôles</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                form.reset({
                  name: "",
                  description: "",
                  color: "#7289da",
                  permissions: [],
                });
                setEditing(null);
              }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau rôle
              </Button>
            </DialogTrigger>
            {renderDialogContent()}
          </Dialog>
        </div>

        <div className="mt-6">
          {roles.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Aucun rôle personnalisé n'a encore été créé
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={handleEdit}
                  onDelete={deleteRole}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 