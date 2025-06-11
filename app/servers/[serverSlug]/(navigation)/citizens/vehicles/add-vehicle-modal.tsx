"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { VehicleForm, transformFormToServerData, type VehicleFormValues } from "./vehicle-form";
import { createVehicleAction } from "./vehicles.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { logger } from "@/lib/logger";

export default function AddVehicleModal({ 
  citizenId,
  citizenName,
}: { 
  citizenId: string;
  citizenName: string;
}) {
  const t = useTranslations("Vehicles");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClose = () => {
    router.back();
  };

  const onSubmit = async (data: VehicleFormValues) => {
    startTransition(async () => {
      try {
        const serverData = transformFormToServerData(data, citizenId);
        await createVehicleAction(serverData);
        toast.success(t("addSuccess"));
        onClose();
      } catch (error) {
        toast.error(t("addError"));
        logger.error(error);
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {t("addVehicle")} - {citizenName}
          </DialogTitle>
        </DialogHeader>

        <VehicleForm
          onSubmit={onSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
          citizenId={citizenId}
        />
      </DialogContent>
    </Dialog>
  );
} 