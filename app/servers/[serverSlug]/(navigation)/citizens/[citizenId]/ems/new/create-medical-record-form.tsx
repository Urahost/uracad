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
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { createMedicalRecordAction } from "../../../_components/create-medical-record.action";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Plus } from "lucide-react";
import { LoadingButton } from "@/features/form/submit-button";
import { useTranslations } from "next-intl";

const Schema = z.object({
  type: z.enum(["CARE", "INJURY", "TRAUMA", "PSYCHOLOGY", "DEATH"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isConfidential: z.boolean().default(false),
  isPoliceVisible: z.boolean().default(false),
  restrictedAccess: z.boolean().default(false),
});

type Citizen = {
  id: string;
  name: string;
  surname: string;
};

function MedicalRecordForm({ citizen, onSuccess }: { citizen: Citizen; onSuccess?: () => void }) {
  const t = useTranslations("EMS");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const form = useZodForm({
    schema: Schema,
    defaultValues: {
      isConfidential: false,
      isPoliceVisible: false,
      restrictedAccess: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof Schema>) => {
      return resolveActionResult(
        createMedicalRecordAction({
          ...data,
          citizenId: citizen.id,
        }),
      );
    },
    onSuccess: () => {
      toast.success(t("form.recordCreated"));
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Form form={form} onSubmit={async (data) => mutation.mutate(data)}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("details.type")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectType")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CARE">{t("recordType.care")}</SelectItem>
                  <SelectItem value="INJURY">{t("recordType.injury")}</SelectItem>
                  <SelectItem value="TRAUMA">{t("recordType.trauma")}</SelectItem>
                  <SelectItem value="PSYCHOLOGY">{t("recordType.psychology")}</SelectItem>
                  <SelectItem value="DEATH">{t("recordType.death")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("details.title")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("details.description")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isConfidential"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>{t("settings.confidential")}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t("settings.markConfidential")}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPoliceVisible"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>{t("settings.policeVisible")}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t("settings.allowPoliceView")}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="restrictedAccess"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>{t("settings.restrictedAccess")}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t("settings.restrictAccess")}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
            {tCommon("cancel")}
          </Button>
          <LoadingButton type="submit" loading={mutation.isPending}>
            {t("form.createRecord")}
          </LoadingButton>
        </div>
      </div>
    </Form>
  );
}

export function CreateMedicalRecordForm({ citizen }: { citizen: Citizen }) {
  const t = useTranslations("EMS");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t("form.addMedicalRecord")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("form.newRecord")}</DialogTitle>
          </DialogHeader>
          <MedicalRecordForm 
            citizen={citizen} 
            onSuccess={() => setOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 