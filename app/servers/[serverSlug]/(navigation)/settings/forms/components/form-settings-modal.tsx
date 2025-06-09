"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  initialWebhookUrl?: string;
  initialRoleMentions?: string;
  initialUserMentions?: string;
  onSave: (webhookUrl: string, roleMentions: string, userMentions: string) => Promise<void>;
}

export function FormSettingsModal({ open, onOpenChange, initialWebhookUrl, initialRoleMentions, initialUserMentions, onSave }: FormSettingsModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? "");
  const [roleMentions, setRoleMentions] = useState(initialRoleMentions ?? "");
  const [userMentions, setUserMentions] = useState(initialUserMentions ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await onSave(webhookUrl, roleMentions, userMentions);
    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paramètres du formulaire</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block text-sm font-medium">Webhook Discord (optionnel)</label>
          <Input
            type="url"
            placeholder="https://discord.com/api/webhooks/..."
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            autoFocus
          />
          <label className="block text-sm font-medium">IDs de rôles à mentionner (séparés par des virgules)</label>
          <Input
            type="text"
            placeholder="375805909219147807,123456789012345678"
            value={roleMentions}
            onChange={e => setRoleMentions(e.target.value)}
          />
          <label className="block text-sm font-medium">IDs d'utilisateurs à mentionner (séparés par des virgules)</label>
          <Input
            type="text"
            placeholder="375805687529209857,987654321098765432"
            value={userMentions}
            onChange={e => setUserMentions(e.target.value)}
          />
        </div>
        <DialogFooter className="mt-4 flex gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">Annuler</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 