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
import { useEffect, useState } from "react";
import { WarrantSchema } from "./warrant.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logger } from "@/lib/logger";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getDepartments, type Department } from "../fines/departments.action";
import { getCurrentUserInfo } from "../fines/current-user.action";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";

type WarrantFormValues = z.infer<typeof WarrantSchema>;

type JudicialCaseOption = {
  id: string;
  caseNumber: string;
  title: string;
};

type WarrantFormProps = {
  citizenId: string;
  submitForm: (data: WarrantFormValues) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  initialData?: Partial<WarrantFormValues>;
  judicialCases?: JudicialCaseOption[];
};

const WARRANT_TYPES = ["ARREST", "SEARCH", "OTHER"];

export function WarrantForm({
  citizenId,
  submitForm,
  isSubmitting,
  onCancel,
  initialData,
  judicialCases = [],
}: WarrantFormProps) {
  const t = useTranslations("Warrants");
  const tCommon = useTranslations("Common");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] =
    useState<boolean>(true);
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    name: string;
    departmentId: string | null;
  }>({
    name: "",
    departmentId: null,
  });

  const form = useZodForm({
    schema: WarrantSchema,
    defaultValues: {
      citizenId,
      type: initialData?.type ?? "ARREST",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      reason: initialData?.reason ?? "",
      issuedDate: initialData?.issuedDate ?? new Date().toISOString(),
      expirationDate:
        initialData?.expirationDate ?? addDays(new Date(), 30).toISOString(),
      issuedByName: initialData?.issuedByName ?? "",
      issuedByDept: initialData?.issuedByDept ?? "",
      status: initialData?.status ?? "ACTIVE",
      notes: initialData?.notes ?? "",
      address: initialData?.address ?? "",
      judicialCaseId: initialData?.judicialCaseId ?? undefined,
    },
  });

  // Charger les départements
  useEffect(() => {
    const loadDepartments = async () => {
      setIsDepartmentsLoading(true);
      try {
        const depts = await getDepartments();
        setDepartments(depts);

        // Appliquer le département par défaut de l'utilisateur si disponible
        // et si l'utilisateur n'a pas déjà sélectionné un département
        if (currentUserInfo.departmentId && !form.getValues("issuedByDept")) {
          // Vérifier si le département de l'utilisateur existe dans la liste
          const userDeptExists = depts.some(
            (dept) => dept.id === currentUserInfo.departmentId,
          );
          if (userDeptExists) {
            form.setValue("issuedByDept", currentUserInfo.departmentId);
          }
        }
      } catch (error) {
        logger.error("Failed to load departments:", error);
        setDepartments([]);
      } finally {
        setIsDepartmentsLoading(false);
      }
    };

    void loadDepartments();
  }, [currentUserInfo.departmentId, form]);

  // Charger les informations de l'utilisateur connecté
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await getCurrentUserInfo();

        // Pré-remplir le nom de l'agent, uniquement si le champ est vide
        if (userInfo.name && !form.getValues("issuedByName")) {
          form.setValue("issuedByName", userInfo.name);
        }

        setCurrentUserInfo(userInfo);
      } catch (error) {
        logger.error("Failed to load user info:", error);
      }
    };

    void loadUserInfo();
  }, [form]);

  const handleSubmit = async (values: WarrantFormValues) => {
    try {
      await submitForm(values);
    } catch (error) {
      logger.error("Error submitting warrant form:", error);
      toast.error(t("addWarrantError"));
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <div className="border-border/40 space-y-4 border-b pb-4">
        <h3 className="text-sm font-medium">{t("mainInformation")}</h3>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("title")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("typeLabel")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectType")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WARRANT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`types.${type.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={t("descriptionPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("reason")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder={t("reasonPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("address")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("addressPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Dates et statut */}
      <div className="border-border/40 space-y-4 border-b pb-4">
        <h3 className="text-sm font-medium">{t("datesAndStatus")}</h3>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issuedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("issuedDate")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", {
                            locale: fr,
                          })
                        ) : (
                          <span>{t("selectDate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date?.toISOString() ?? "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("expirationDate")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", {
                            locale: fr,
                          })
                        ) : (
                          <span>{t("selectDate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date?.toISOString() ?? "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("statusLabel")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectStatus")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
                    <SelectItem value="EXECUTED">
                      {t("status.executed")}
                    </SelectItem>
                    <SelectItem value="EXPIRED">
                      {t("status.expired")}
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      {t("status.cancelled")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {judicialCases.length > 0 && (
            <FormField
              control={form.control}
              name="judicialCaseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("judicialCase")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectCase")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t("noCase")}</SelectItem>
                      {judicialCases.map((jCase) => (
                        <SelectItem key={jCase.id} value={jCase.id}>
                          {jCase.caseNumber} - {jCase.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="border-border/40 space-y-4 border-b pb-4">
        <h3 className="text-sm font-medium">{t("notes")}</h3>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder={t("notesPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Créateur du mandat */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t("warrantIssuer")}</h3>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issuedByName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("issuedByName")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issuedByDept"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("issuedByDept")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isDepartmentsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectDepartment")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        )}
        <LoadingButton type="submit" loading={isSubmitting}>
          {initialData ? t("updateWarrant") : t("createWarrant")}
        </LoadingButton>
      </div>
    </Form>
  );
}
