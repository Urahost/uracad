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
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive().min(1900).max(new Date().getFullYear() + 1).optional()
  ),
  licensePlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string().optional(),
  status: z.enum(["ACTIVE", "STOLEN", "IMPOUNDED", "DESTROYED"]).default("ACTIVE"),
  registrationStatus: z.enum(["REGISTERED", "EXPIRED", "SUSPENDED"]).default("REGISTERED"),
  insuranceStatus: z.string().optional(),
  modifications: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export type VehicleFormValues = z.infer<typeof Schema>;

// Transform the form values to match the schema expected by the server action
const transformFormToServerData = (data: VehicleFormValues, citizenId: string): CreateVehicleSchemaType => {
  return {
    ...data,
    citizenId,
    registrationExpiryDate: undefined, // Ces dates seront gérées dans une version future
    lastInspectionDate: undefined,
  };
};

type VehicleFormProps = {
  defaultValues?: Partial<VehicleFormValues>;
  onSubmit: (data: CreateVehicleSchemaType) => Promise<void>;
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
      status: "ACTIVE",
      registrationStatus: "REGISTERED",
      ...defaultValues,
    },
  });

  return (
    <Form
      form={form}
      onSubmit={async (data) => {
        const serverData = transformFormToServerData(data, citizenId);
        await onSubmit(serverData);
      }}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.makeModel").split("&")[0].trim()}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="BMW, Toyota, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.makeModel").split("&")[1].trim()}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="X5, Corolla, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.year")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    placeholder="2023"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licensePlate"
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
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.color")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Red, Blue, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.type")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("details.category")} ({tCommon("optional")})</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicleCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="status"
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

          <FormField
            control={form.control}
            name="insuranceStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Status ({tCommon("optional")})</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Insured, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <FormField
          control={form.control}
          name="modifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("details.modifications")} ({tCommon("optional")})</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Any modifications to the vehicle"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("details.additionalInfo")} ({tCommon("optional")})</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Any additional information about the vehicle"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end gap-4 pt-4 mt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        )}
        <LoadingButton type="submit" loading={isSubmitting}>
          {tCommon("save")}
        </LoadingButton>
      </div>
    </Form>
  );
} 