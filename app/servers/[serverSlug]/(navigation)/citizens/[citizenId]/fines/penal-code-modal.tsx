"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PenalCodeForm } from "./penal-code-form";
import { createPenalCodeAction } from "./penal-code.action";
import type { PenalCodeCreateSchemaType } from "./penal-code.schema";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function PenalCodeModal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClose = () => {
    router.back();
  };

  const onSubmit = async (data: PenalCodeCreateSchemaType) => {
    startTransition(async () => {
      try {
        await createPenalCodeAction(data);
        toast.success("Code pénal ajouté avec succès");
        onClose();
      } catch (error) {
        toast.error("Échec de l'ajout du code pénal");
        logger.error(error);
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            Ajouter une infraction au code pénal
          </DialogTitle>
        </DialogHeader>

        <PenalCodeForm
          onSubmit={onSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 