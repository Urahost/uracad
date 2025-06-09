"use client";

import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

type CopyLinkButtonProps = {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier");
      }}
      title="Copier le lien public"
    >
      <CopyIcon className="w-4 h-4" />
    </Button>
  );
} 