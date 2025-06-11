"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { VehicleFormValues } from "./vehicle-form";
import { VehicleForm, transformFormToServerData } from "./vehicle-form";
import { updateVehicleAction, type CreateVehicleSchemaType } from "./vehicles.action";
import { toast } from "sonner";
import type { Vehicle } from "@prisma/client";
import { useTranslations } from "next-intl";
import { logger } from "@/lib/logger";

export default function EditVehicleModal({ 
  vehicle,
  citizenName,
}: { 
  vehicle: Vehicle;
  citizenName: string;
}) {
  const t = useTranslations("Vehicles");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClose = () => {
    router.back();
  };

  const defaultValues: VehicleFormValues = {
    plate: vehicle.plate,
    model: vehicle.model,
    state: vehicle.state.toUpperCase() as "ACTIVE" | "STOLEN" | "IMPOUNDED" | "DESTROYED",
    registrationStatus: "REGISTERED",
    vin: vehicle.vin ?? undefined,
  };

  const onSubmit = async (data: CreateVehicleSchemaType) => {
    startTransition(async () => {
      try {
        await updateVehicleAction({
          ...data,
          id: vehicle.id,
        });
        toast.success(t("editSuccess"));
        onClose();
      } catch (error) {
        toast.error(t("editError"));
        logger.error(error);
      }
    });
  };

  const handleFormSubmit = async (formData: VehicleFormValues) => {
    const serverData = transformFormToServerData(formData, vehicle.citizenId);
    await onSubmit(serverData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {t("editVehicle")} - {citizenName}
          </DialogTitle>
        </DialogHeader>

        <VehicleForm
          defaultValues={defaultValues}
          onSubmit={handleFormSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
          citizenId={vehicle.citizenId}
        />
      </DialogContent>
    </Dialog>
  );
} 