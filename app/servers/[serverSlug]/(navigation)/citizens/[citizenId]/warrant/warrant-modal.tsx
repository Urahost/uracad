"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WarrantForm } from "./warrant-form";
import { createWarrantAction, updateWarrantAction } from "./warrant.action";
import { useTranslations } from "next-intl";
import { type WarrantSchemaType, type WarrantUpdateSchemaType } from "./warrant.schema";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

type JudicialCaseOption = {
  id: string;
  caseNumber: string;
  title: string;
};

type WarrantModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  citizenId: string;
  initialData?: Partial<WarrantSchemaType & { id: string }>;
  judicialCases?: JudicialCaseOption[];
}

export function WarrantModal({ 
  open, 
  onOpenChange, 
  citizenId, 
  initialData,
  judicialCases = [] 
}: WarrantModalProps) {
  const router = useRouter();
  const t = useTranslations("Warrants");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: WarrantSchemaType | WarrantUpdateSchemaType) => {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        // Mise à jour d'un mandat existant
        const updateData = { id: initialData.id, ...data } as WarrantUpdateSchemaType;
        const result = await updateWarrantAction(updateData);
        
        if (!result) {
          throw new Error("Erreur lors de la mise à jour du mandat");
        }
        
        toast.success(t("warrantUpdated"));
      } else {
        // Création d'un nouveau mandat
        const result = await createWarrantAction(data as WarrantSchemaType);
        
        if (!result) {
          throw new Error("Erreur lors de la création du mandat");
        }
        
        toast.success(t("warrantCreated"));
      }
      
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      logger.error("Erreur lors de la soumission du mandat:", error);
      toast.error(t("warrantError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? t("editWarrant") : t("createNewWarrant")}
          </DialogTitle>
        </DialogHeader>
        
        <WarrantForm 
          citizenId={citizenId}
          submitForm={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          initialData={initialData}
          judicialCases={judicialCases}
        />
      </DialogContent>
    </Dialog>
  );
} 