"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteVehicleAction } from "./vehicles.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { logger } from "@/lib/logger";

export default function DeleteVehicleModal({
  vehicleId,
  vehicleInfo,
}: {
  vehicleId: string;
  vehicleInfo: string;
}) {
  const t = useTranslations("Vehicles");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClose = () => {
    router.back();
  };

  const onDelete = () => {
    startTransition(async () => {
      try {
        await deleteVehicleAction({ id: vehicleId });
        toast.success(t("deleteSuccess"));
        onClose();
      } catch (error) {
        toast.error(t("deleteError"));
        logger.error(error);
      }
    });
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tCommon("confirmDelete")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteConfirm")} {vehicleInfo}. {tCommon("thisActionCannot")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? `${tCommon("delete")}...` : tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 