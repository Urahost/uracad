"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useRouter } from "next/navigation";
import { deleteMedicalRecordAction } from "../../../ems/records/records.action";

type DeleteRecordModalProps = {
  record: {
    id: string;
    title: string;
  };
  redirectAfterDelete?: string;
};

export function DeleteRecordModal({ record, redirectAfterDelete }: DeleteRecordModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return resolveActionResult(
        deleteMedicalRecordAction({
          id: record.id,
        }),
      );
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      setOpen(false);
      
      // Rafraîchir l'interface
      router.refresh();
      
      // Rediriger si une URL est fournie
      if (redirectAfterDelete) {
        router.push(redirectAfterDelete);
      }
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the record &quot;{record.title}&quot;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteMutation.mutate();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 