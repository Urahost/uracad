"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

// Composants UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingButton } from "@/features/form/submit-button";
import { authClient } from "@/lib/auth-client";
import { RolesKeys } from "@/lib/auth/auth-permissions";
import { logger } from "@/lib/logger";

// Importation du gestionnaire de liens d'invitation
import { InviteLinkManager } from "./invite-link-manager";

// Types et schémas
const EmailSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
  role: z.string().default("member"),
});

type EmailSchemaType = z.infer<typeof EmailSchema>;
type AvailableRole = Exclude<(typeof RolesKeys)[number], "owner">;

// Formatage des rôles
const formatRoleName = (role?: string): string => {
  if (!role) return "Inconnu";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export const ServerInviteMemberForm = () => {
  // États
  const [activeTab, setActiveTab] = useState("email");
  const [open, setOpen] = useState(false);
  
  // Data 
  const { data: activeServer } = authClient.useActiveOrganization();

  // Formulaires
  const emailForm = useZodForm({
    schema: EmailSchema,
    defaultValues: { email: "", role: "member" },
  });

  // Invitation par email
  const emailInviteMutation = useMutation({
    mutationFn: async (values: EmailSchemaType) => {
      const result = await authClient.organization.inviteMember({
        email: values.email,
        role: values.role as AvailableRole,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Invitation envoyée avec succès");
      emailForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'envoi de l'invitation");
      logger.error(error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Inviter</Button>
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-[600px]">
        <DialogHeader className="p-6">
          <div className="mt-4 flex justify-center">
            <Avatar className="size-16">
              {activeServer?.logo ? (
                <AvatarImage src={activeServer.logo} alt={activeServer.name} />
              ) : null}
              <AvatarFallback>
                {activeServer?.name?.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <DialogTitle className="text-center">public</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mx-auto">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="link">Lien d'invitation</TabsTrigger>
          </TabsList>

          <div className="p-6">
            {/* Onglet Email */}
            <TabsContent value="email" className="mt-0">
              <Form
                form={emailForm}
                onSubmit={(values) => emailInviteMutation.mutate(values)}
                className="space-y-4"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemple.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value as string}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RolesKeys.filter(role => role !== "owner").map((role, index) => (
                            <SelectItem 
                              key={`email-role-${role}-${index}`} 
                              value={role.toLowerCase()}
                            >
                              {formatRoleName(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <LoadingButton 
                  loading={emailInviteMutation.isPending} 
                  type="submit" 
                  className="w-full"
                >
                  Envoyer l'invitation
                </LoadingButton>
              </Form>
            </TabsContent>

            {/* Onglet Lien d'invitation */}
            <TabsContent value="link" className="mt-0">
              <InviteLinkManager />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
