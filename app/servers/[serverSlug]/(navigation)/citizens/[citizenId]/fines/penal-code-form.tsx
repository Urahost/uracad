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
import { LoadingButton } from "@/features/form/submit-button";
import type { z } from "zod";
import { PenalCodeCreateSchema } from "./penal-code.schema";

type PenalCodeFormValues = z.infer<typeof PenalCodeCreateSchema>;

type PenalCodeFormProps = {
  defaultValues?: Partial<PenalCodeFormValues>;
  onSubmit: (data: PenalCodeFormValues) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
};

export function PenalCodeForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: PenalCodeFormProps) {
  
  const form = useZodForm({
    schema: PenalCodeCreateSchema,
    defaultValues: {
      minFine: 0,
      maxFine: 0,
      ...defaultValues,
    },
  });

  return (
    <Form
      form={form}
      onSubmit={async (data) => {
        await onSubmit(data);
      }}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-2 gap-4">
          {/* Code */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="A-101" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Catégorie */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Trafic routier" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Description de l'infraction" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Amende minimale */}
          <FormField
            control={form.control}
            name="minFine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amende minimale ($)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amende maximale */}
          <FormField
            control={form.control}
            name="maxFine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amende maximale ($)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Points de permis */}
          <FormField
            control={form.control}
            name="licensePoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points de permis</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={12}
                    onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Temps de prison */}
          <FormField
            control={form.control}
            name="jailTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temps de prison (min)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Notes supplémentaires" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex justify-end gap-4 pt-4 mt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <LoadingButton type="submit" loading={isSubmitting}>
          Enregistrer
        </LoadingButton>
      </div>
    </Form>
  );
} 