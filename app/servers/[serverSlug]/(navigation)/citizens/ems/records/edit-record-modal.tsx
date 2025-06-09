"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateMedicalRecordAction } from "./records.action";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { MedicalRecordForm } from "./medical-record-form";

type EditRecordModalProps = {
  record: {
    id: string;
    type: "CARE" | "INJURY" | "TRAUMA" | "PSYCHOLOGY" | "DEATH";
    title: string;
    description: string;
    isConfidential: boolean;
    isPoliceVisible: boolean;
    restrictedAccess: boolean;
  };
};

export function EditRecordModal({ record }: EditRecordModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<typeof record, "id">) => {
      return resolveActionResult(
        updateMedicalRecordAction({
          id: record.id,
          ...data,
        }),
      );
    },
    onSuccess: () => {
      toast.success("Medical record updated successfully");
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Medical Record</DialogTitle>
        </DialogHeader>
        <MedicalRecordForm
          defaultValues={record}
          onSubmit={async (data) => updateMutation.mutate(data)}
          isSubmitting={updateMutation.isPending}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 