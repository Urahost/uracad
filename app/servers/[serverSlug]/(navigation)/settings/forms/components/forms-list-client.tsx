"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FormCard } from "./form-card";
import { updateFormWebhook } from "../form-actions";
import type { FormWithQuestionsAndCount } from "./form-card";
import { logger } from "@/lib/logger";

type FormsListClientProps = {
  forms: FormWithQuestionsAndCount[];
  server: { slug: string };
};

export function FormsListClient({ forms, server }: FormsListClientProps) {
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenSettings = (formId: string) => {
    setSettingsOpen(formId);
  };
  const handleCloseSettings = () => setSettingsOpen(null);

  const handleSaveWebhook = async (url: string) => {
    if (!settingsOpen) return;
    try {
      await updateFormWebhook(settingsOpen, url, "", "");
      toast.success("Webhook enregistré !");
    } catch (e) {
      logger.error("Error saving webhook", e);
      toast.error("Error saving webhook");
    }
  };

  const handleDelete = async (formId: string) => {
    setDeletingId(formId);
    // TODO: Appeler une server action pour supprimer le formulaire
    toast.success("Formulaire supprimé");
    setDeletingId(null);
  };

  if (forms.length === 0) {
    return <div className="border rounded p-4 text-muted-foreground text-center">Aucun formulaire pour l'instant.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {forms.map((form) => (
        <FormCard
          key={form.id}
          form={form}
          server={server}
          onDelete={handleDelete}
          deleting={deletingId === form.id}
          onOpenSettings={handleOpenSettings}
          settingsOpen={settingsOpen === form.id}
          onCloseSettings={handleCloseSettings}
          onSaveWebhook={handleSaveWebhook}
        />
      ))}
    </div>
  );
} 