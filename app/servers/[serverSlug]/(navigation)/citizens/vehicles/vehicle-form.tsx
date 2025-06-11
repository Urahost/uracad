"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { LoadingButton } from "@/features/form/submit-button";
import type { CreateVehicleSchemaType } from "./vehicles.action";
import { useTranslations } from "next-intl";

const vehicleTypes = [
  "Car",
  "Motorcycle",
  "Truck",
  "SUV",
  "Van",
  "Bus",
  "Boat",
  "Plane",
  "Other",
];

const vehicleCategories = [
  "Sedan",
  "Coupé",
  "Hatchback",
  "Station Wagon",
  "Pickup",
  "Convertible",
  "Minivan",
  "Compact",
  "Electric",
  "Hybrid",
  "Sport",
  "Luxury",
  "Off-road",
  "Utility",
];

const Schema = z.object({
  plate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  state: z.enum(["ACTIVE", "STOLEN", "IMPOUNDED", "DESTROYED"]).default("ACTIVE"),
  registrationStatus: z.enum(["REGISTERED", "EXPIRED", "SUSPENDED"]).default("REGISTERED"),
});

export type VehicleFormValues = z.infer<typeof Schema>;

// Transform the form values to match the schema expected by the server action
export const transformFormToServerData = (data: VehicleFormValues, citizenId: string): CreateVehicleSchemaType => {
  return {
    citizenId,
    brand: data.model.split(" ")[0] ?? "Unknown",
    model: data.model,
    plate: data.plate,
    vin: data.vin,
    color: "Unknown",
    type: "Car",
    status: data.state,
    registrationStatus: data.registrationStatus,
  };
};

type VehicleFormProps = {
  defaultValues?: Partial<VehicleFormValues>;
  onSubmit: (data: VehicleFormValues) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  citizenId: string;
};

export function VehicleForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
  citizenId,
}: VehicleFormProps) {
  const t = useTranslations("Vehicles");
  const tCommon = useTranslations("Common");

  const form = useZodForm({
    schema: Schema,
    defaultValues: {
      ...defaultValues,
    },
  });

  return (
    <Form
      form={form}
      onSubmit={onSubmit}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.licensePlate")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ABC-123" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.vin")} ({tCommon("optional")})</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Vehicle Identification Number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("details.makeModel")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Vehicle Model" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.status")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
                    <SelectItem value="STOLEN">{t("status.stolen")}</SelectItem>
                    <SelectItem value="IMPOUNDED">{t("status.impounded")}</SelectItem>
                    <SelectItem value="DESTROYED">{t("status.destroyed")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.registration")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select registration status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="REGISTERED">{t("registration.registered")}</SelectItem>
                    <SelectItem value="EXPIRED">{t("registration.expired")}</SelectItem>
                    <SelectItem value="SUSPENDED">{t("registration.suspended")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} type="button">
              {tCommon("cancel")}
            </Button>
          )}
          <LoadingButton type="submit" loading={isSubmitting}>
            {tCommon("save")}
          </LoadingButton>
        </div>
      </div>
    </Form>
  );
} 