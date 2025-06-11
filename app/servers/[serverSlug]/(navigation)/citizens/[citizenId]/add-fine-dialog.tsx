"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FineForm } from "./fines/fine-form";
import { createFineAction } from "./fines/fines.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getVehiclesByCitizenAction } from "../vehicles/vehicles.action";
import { logger } from "@/lib/logger";
import type { FineCreateSchemaType } from "./fines/fines.schema";
import { PlusIcon } from "lucide-react";
import type { Citizen } from "@prisma/client";

type AddFineDialogProps = {
  citizen: Pick<Citizen, 'id' | 'name' | 'lastName' | 'metadata'>;
};

type VehicleOption = {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  year?: number | null;
  type: string;
  status: string;
};

type VehicleResponse = {
  id: string;
  brand: string | null;
  model: string;
  plate: string;
  vin: string | null;
  color: unknown;
  type: string | null;
  state: string;
};

type VehicleActionResponse = {
  data: VehicleResponse[];
};

export default function AddFineDialog({
  citizen,
}: AddFineDialogProps) {
  const t = useTranslations("Fines");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const loadVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const response = await getVehiclesByCitizenAction({
        citizenId: citizen.id,
      });
      
      if (!response?.data) {
        setVehicles([]);
        return;
      }

      const mappedVehicles: VehicleOption[] = response.data.map(vehicle => {
        const colorValue = typeof vehicle.color === 'string' ? vehicle.color : null;
        return {
          id: vehicle.id,
          make: vehicle.brand ?? 'Unknown',
          model: vehicle.model,
          licensePlate: vehicle.plate,
          color: colorValue ?? 'Unknown',
          year: null,
          type: (vehicle.type as string | undefined) ?? 'Unknown',
          status: vehicle.state
        };
      });
      setVehicles(mappedVehicles);
    } catch (error) {
      logger.error("Failed to load vehicles:", error);
      setVehicles([]);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      void loadVehicles();
    } else {
      setVehicles([]);
    }
    setIsOpen(open);
  };

  const onSubmit = async (data: FineCreateSchemaType) => {
    startTransition(async () => {
      try {
        await createFineAction(data);
        toast.success(t("actions.addSuccess"));
        router.refresh();
        setIsOpen(false);
      } catch (error) {
        toast.error(t("actions.addError"));
        logger.error(error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4" />
          {t("addFine")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">
            {t("addFine")} - {citizen.name} {citizen.lastName}
          </DialogTitle>
        </DialogHeader>
        <FineForm
          citizenId={citizen.id}
          submitForm={onSubmit}
          isSubmitting={isPending}
          onCancel={() => setIsOpen(false)}
          currentLicensePoints={typeof citizen.metadata === 'string' ? JSON.parse(citizen.metadata).driversLicensePoints ?? 0 : 0}
          vehicles={vehicles}
        />
      </DialogContent>
    </Dialog>
  );
} 