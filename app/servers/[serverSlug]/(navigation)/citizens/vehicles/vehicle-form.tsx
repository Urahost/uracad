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
import { z } from "zod";
import { LoadingButton } from "@/features/form/submit-button";
import type { CreateVehicleSchemaType } from "./vehicles.action";
import { useTranslations } from "next-intl";

const Schema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive().min(1900).max(new Date().getFullYear() + 1).optional()
  ),
  licensePlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  additionalInfo: z.string().optional(),
  color: z.string().default("UNKNOWN"),
  type: z.string().default("CAR"),
});

export type VehicleFormValues = z.infer<typeof Schema>;

// Transform the form values to match the schema expected by the server action
const transformFormToServerData = (data: VehicleFormValues, citizenId: string): CreateVehicleSchemaType => {
  return {
    ...data,
    citizenId,
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