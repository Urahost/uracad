"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { createMedicalRecordAction } from "./create-medical-record.action";
import { MedicalRecordForm } from "../ems/records/medical-record-form";
import { useTranslations } from "next-intl";

type Citizen = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
};

export function CreateMedicalRecordForm({ citizen }: { citizen: Citizen }) {
  const t = useTranslations("EMS");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: Omit<Parameters<typeof createMedicalRecordAction>[0], "citizenId">) => {
      return resolveActionResult(
        createMedicalRecordAction({
          ...data,
          citizenId: citizen.id,
        }),
      );
    },
    onSuccess: () => {
      toast.success(t("form.recordCreated"));
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />

        {t("form.addMedicalRecord")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("form.newRecord")}</DialogTitle>
          </DialogHeader>
          <MedicalRecordForm
            onSubmit={async (data) => mutation.mutate(data)}
            isSubmitting={mutation.isPending}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 