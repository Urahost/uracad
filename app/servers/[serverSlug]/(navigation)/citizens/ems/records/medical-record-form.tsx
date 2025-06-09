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

type FormData = z.infer<typeof Schema>;

type MedicalRecordFormProps = {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function MedicalRecordForm({ 
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: MedicalRecordFormProps) {
  const t = useTranslations("EMS");
  const tCommon = useTranslations("Common");
  
  const form = useZodForm({
    schema: Schema,
    defaultValues: {
      isConfidential: false,
      isPoliceVisible: false,
      restrictedAccess: false,
      ...defaultValues,
    },
  });

  return (
    <Form form={form} onSubmit={async (data) => onSubmit(data)}>
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
                    <SelectValue placeholder={tCommon("selectType")} />
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
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
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