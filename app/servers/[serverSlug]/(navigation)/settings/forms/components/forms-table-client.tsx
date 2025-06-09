"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "./copy-link-button";
import { FormSettingsModal } from "./form-settings-modal";
import { PencilIcon, Settings2Icon, Trash2Icon } from "lucide-react";
import { deleteForm, updateFormWebhook } from "../form-actions";
import { getServerUrl } from "@/lib/server-url";
import type { FormWithQuestionsAndCount } from "./form-card";
import { logger } from "@/lib/logger";

type FormsTableClientProps = {
  forms: FormWithQuestionsAndCount[];
  server: { slug: string };
};

export function FormsTableClient({ forms: initialForms, server }: FormsTableClientProps) {
  const [forms, setForms] = useState(initialForms);
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenSettings = (formId: string) => setSettingsOpen(formId);
  const handleCloseSettings = () => setSettingsOpen(null);

  const handleSaveWebhook = async (webhookUrl: string, roleMentions: string, userMentions: string) => {
    if (!settingsOpen) return;
    try {
      await updateFormWebhook(settingsOpen, webhookUrl, roleMentions, userMentions);
      toast.success("Webhook enregistré !");
      setForms(forms => forms.map(f => f.id === settingsOpen ? { ...f, webhookUrl, webhookMentions: JSON.stringify({ roles: roleMentions.split(",").map(s => s.trim()).filter(Boolean), users: userMentions.split(",").map(s => s.trim()).filter(Boolean) }) } : f));
    } catch (e) {
      logger.error("Erreur lors de l'enregistrement du webhook", e);
      toast.error("Erreur lors de l'enregistrement du webhook");
    }
  };

  const handleDelete = async (formId: string) => {
    setDeletingId(formId);
    startTransition(async () => {
      try {
        await deleteForm(formId);
        setForms(forms => forms.filter(f => f.id !== formId));
        toast.success("Formulaire supprimé");
      } catch (e) {
        logger.error("Erreur lors de la suppression du formulaire", e);
        toast.error("Erreur lors de la suppression");
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (forms.length === 0) {
    return <div className="border rounded p-4 text-muted-foreground text-center">Aucun formulaire pour l'instant.</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-6">
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left font-semibold whitespace-nowrap">Titre</th>
              <th className="p-4 text-left font-semibold whitespace-nowrap max-w-xs">Description</th>
              <th className="p-4 text-center font-semibold whitespace-nowrap">Questions</th>
              <th className="p-4 text-center font-semibold whitespace-nowrap">Réponses</th>
              <th className="p-4 text-center font-semibold whitespace-nowrap">Mentions</th>
              <th className="p-4 text-center font-semibold whitespace-nowrap">Lien public</th>
              <th className="p-4 text-center font-semibold whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => {
              const publicUrl = `${getServerUrl()}/servers/${server.slug}/public/forms/${form.id}`;
              const mentions = form.webhookMentions ? JSON.parse(form.webhookMentions) : { roles: [], users: [] };
              return (
                <tr key={form.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors group">
                  <td className="p-4 font-medium max-w-xs truncate" title={form.title}>{form.title}</td>
                  <td className="p-4 text-muted-foreground max-w-xs truncate" title={form.description ?? undefined}>{form.description}</td>
                  <td className="p-4 text-center">{form.questions.length}</td>
                  <td className="p-4 text-center">{form._count.responses}</td>
                  <td className="p-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {mentions.roles.length > 0 && (
                        <span className="inline-flex items-center rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium mr-1">Rôles: {mentions.roles.map((id: string) => <span key={id} className="ml-1">&lt;@&amp;{id}&gt;</span>)}</span>
                      )}
                      {mentions.users.length > 0 && (
                        <span className="inline-flex items-center rounded bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">Users: {mentions.users.map((id: string) => <span key={id} className="ml-1">&lt;@{id}&gt;</span>)}</span>
                      )}
                      {mentions.roles.length === 0 && mentions.users.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <CopyLinkButton url={publicUrl} />
                  </td>
                  <td className="p-4 flex gap-2 justify-center items-center">
                    <Link href={`/servers/${server.slug}/settings/forms/${form.id}/edit`}>
                      <Button size="icon" variant="ghost" title="Modifier le formulaire" className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button size="icon" variant="ghost" title="Paramètres"
                      onClick={() => handleOpenSettings(form.id)}
                      className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <Settings2Icon className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Supprimer"
                      onClick={async () => handleDelete(form.id)}
                      disabled={deletingId === form.id || isPending}
                      className="focus:ring-2 focus:ring-destructive focus:ring-offset-2">
                      <Trash2Icon className="w-4 h-4 text-destructive" />
                    </Button>
                    <FormSettingsModal
                      open={settingsOpen === form.id}
                      onOpenChange={open => open ? handleOpenSettings(form.id) : handleCloseSettings()}
                      formId={form.id}
                      initialWebhookUrl={form.webhookUrl ?? undefined}
                      initialRoleMentions={mentions.roles?.join(",")}
                      initialUserMentions={mentions.users?.join(",")}
                      onSave={handleSaveWebhook}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 