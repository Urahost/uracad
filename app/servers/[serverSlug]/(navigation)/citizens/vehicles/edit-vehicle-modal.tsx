"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { VehicleFormValues } from "./vehicle-form";
import { VehicleForm } from "./vehicle-form";
import { updateVehicleAction } from "./vehicles.action";
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
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year ?? undefined,
    licensePlate: vehicle.licensePlate,
    vin: vehicle.vin ?? undefined,
    color: vehicle.color,
    type: vehicle.type,
    category: vehicle.category ?? undefined,
    status: vehicle.status as "ACTIVE" | "STOLEN" | "IMPOUNDED" | "DESTROYED",
    registrationStatus: vehicle.registrationStatus as "REGISTERED" | "EXPIRED" | "SUSPENDED",
    insuranceStatus: vehicle.insuranceStatus ?? undefined,
    modifications: vehicle.modifications ?? undefined,
    additionalInfo: vehicle.additionalInfo ?? undefined,
  };

  const onSubmit = async (formData: VehicleFormValues) => {
    startTransition(async () => {
      try {
        await updateVehicleAction({
          ...formData,
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
          onSubmit={onSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
          citizenId={vehicle.citizenId}
        />
      </DialogContent>
    </Dialog>
  );
} 