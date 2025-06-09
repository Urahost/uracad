"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JudicialCaseForm } from "./judicial-case-form";
import { createJudicialCaseAction, updateJudicialCaseAction } from "./judicial-case.action";
import { useTranslations } from "next-intl";
import { type JudicialCaseSchemaType, type JudicialCaseUpdateSchemaType } from "./judicial-case.schema";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

type JudicialCaseModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  citizenId: string;
  initialData?: Partial<JudicialCaseSchemaType & { id: string }>;
}

export function JudicialCaseModal({ 
  open, 
  onOpenChange, 
  citizenId, 
  initialData 
}: JudicialCaseModalProps) {
  const router = useRouter();
  const t = useTranslations("Judicial");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: JudicialCaseSchemaType | JudicialCaseUpdateSchemaType) => {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        // Mise à jour d'un dossier existant
        const updateData = { id: initialData.id, ...data } as JudicialCaseUpdateSchemaType;
        const result = await updateJudicialCaseAction(updateData);
        
        if (!result) {
          throw new Error("Erreur lors de la mise à jour du dossier judiciaire");
        }
        
        toast.success(t("caseUpdated"));
      } else {
        // Création d'un nouveau dossier
        const result = await createJudicialCaseAction(data as JudicialCaseSchemaType);
        
        if (!result) {
          throw new Error("Erreur lors de la création du dossier judiciaire");
        }
        
        toast.success(t("caseCreated"));
      }
      
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      logger.error("Erreur lors de la soumission du dossier judiciaire:", error);
      toast.error(t("updateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? t("editCase") : t("createNewCase")}
          </DialogTitle>
        </DialogHeader>
        
        <JudicialCaseForm 
          citizenId={citizenId}
          submitForm={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
} 