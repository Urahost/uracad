"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "./copy-link-button";
import Link from "next/link";
import { PencilIcon, LinkIcon, MessageSquareIcon, Settings2Icon, Trash2Icon } from "lucide-react";
import { FormSettingsModal } from "./form-settings-modal";
import type { Form, Question } from "@prisma/client";

// Type composite pour le formulaire avec questions et _count
export type FormWithQuestionsAndCount = Form & {
  questions: Question[];
  _count: { responses: number };
};

type FormCardProps = {
  form: FormWithQuestionsAndCount;
  server: { slug: string };
  onDelete: (formId: string) => void;
  deleting: boolean;
  onOpenSettings: (formId: string, initialWebhookUrl?: string) => void;
  settingsOpen: boolean;
  onCloseSettings: () => void;
  onSaveWebhook: (url: string) => Promise<void>;
};

export function FormCard({ form, server, onDelete, deleting, onOpenSettings, settingsOpen, onCloseSettings, onSaveWebhook }: FormCardProps) {
  const publicUrl = `${window.location.origin}/servers/${server.slug}/public/forms/${form.id}`;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{form.title}</CardTitle>
        <div className="flex items-center gap-2">
          <CopyLinkButton url={publicUrl} />
          <Link href={`/servers/${server.slug}/settings/forms/${form.id}/edit`}>
            <Button size="icon" variant="ghost" title="Modifier le formulaire">
              <PencilIcon className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="icon" variant="ghost" title="Paramètres"
            onClick={() => onOpenSettings(form.id, form.webhookUrl ?? undefined)}>
            <Settings2Icon className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Supprimer"
            onClick={() => onDelete(form.id)} disabled={deleting}>
            <Trash2Icon className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {form.description && (
            <p className="text-sm text-muted-foreground">{form.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquareIcon className="w-3 h-3" />
              {form._count.responses} réponse{form._count.responses > 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <LinkIcon className="w-3 h-3" />
              {form.questions.length} question{form.questions.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
      <FormSettingsModal
        open={settingsOpen}
        onOpenChange={open => open ? onOpenSettings(form.id, form.webhookUrl ?? undefined) : onCloseSettings()}
        formId={form.id}
        initialWebhookUrl={form.webhookUrl ?? undefined}
        onSave={onSaveWebhook}
      />
    </Card>
  );
} 