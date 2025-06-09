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
import { JudicialCaseSchema } from "./judicial-case.schema";
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

type JudicialCaseFormValues = z.infer<typeof JudicialCaseSchema>;

type JudicialCaseFormProps = {
  citizenId: string;
  submitForm: (data: JudicialCaseFormValues) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  initialData?: Partial<JudicialCaseFormValues>;
};

const CASE_CATEGORIES = [
  "CRIMINAL",
  "CIVIL",
  "TRAFFIC",
  "JUVENILE",
  "FAMILY",
  "NARCOTICS",
  "WHITE_COLLAR",
  "OTHER"
];

export function JudicialCaseForm({
  citizenId,
  submitForm,
  isSubmitting,
  onCancel,
  initialData,
}: JudicialCaseFormProps) {
  const t = useTranslations("Judicial");
  const tCommon = useTranslations("Common");
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState<boolean>(true);
  const [currentUserInfo, setCurrentUserInfo] = useState<{ name: string; departmentId: string | null }>({
    name: "",
    departmentId: null
  });

  const form = useZodForm({
    schema: JudicialCaseSchema,
    defaultValues: {
      citizenId,
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? "CRIMINAL",
      status: initialData?.status ?? "PENDING",
      charges: initialData?.charges ?? "",
      verdict: initialData?.verdict ?? "",
      sentenceDetails: initialData?.sentenceDetails ?? "",
      judgeName: initialData?.judgeName ?? "",
      filingDate: initialData?.filingDate ?? new Date().toISOString(),
      hearingDate: initialData?.hearingDate ?? "",
      isSealed: initialData?.isSealed ?? false,
      isSensitive: initialData?.isSensitive ?? false,
      createdByName: initialData?.createdByName ?? "",
      createdByDept: initialData?.createdByDept ?? "",
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
        if (currentUserInfo.departmentId && !form.getValues("createdByDept")) {
          // Vérifier si le département de l'utilisateur existe dans la liste
          const userDeptExists = depts.some(dept => dept.id === currentUserInfo.departmentId);
          if (userDeptExists) {
            form.setValue("createdByDept", currentUserInfo.departmentId);
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
        if (userInfo.name && !form.getValues("createdByName")) {
          form.setValue("createdByName", userInfo.name);
        }
        
        setCurrentUserInfo(userInfo);
      } catch (error) {
        logger.error("Failed to load user info:", error);
      }
    };
    
    void loadUserInfo();
  }, [form]);

  const handleSubmit = async (values: JudicialCaseFormValues) => {
    try {
      await submitForm(values);
    } catch (error) {
      logger.error("Error submitting judicial case form:", error);
      toast.error(t("addCaseError"));
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
        {/* Informations principales */}
        <div className="space-y-4 border-b border-border/40 pb-4">
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("category")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CASE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`categories.${category.toLowerCase()}`)}
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
            name="charges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("charges")}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={3} 
                    placeholder={t("chargesPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Dates et statut */}
        <div className="space-y-4 border-b border-border/40 pb-4">
          <h3 className="text-sm font-medium">{t("datesAndStatus")}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="filingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("filingDate")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
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
                        onSelect={(date) => field.onChange(date?.toISOString() ?? "")} 
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
              name="hearingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("hearingDate")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
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
                        onSelect={(date) => field.onChange(date?.toISOString() ?? "")}
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
                      <SelectItem value="PENDING">{t("status.pending")}</SelectItem>
                      <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
                      <SelectItem value="CLOSED">{t("status.closed")}</SelectItem>
                      <SelectItem value="DISMISSED">{t("status.dismissed")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="judgeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("judgeName")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("judgeNamePlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Verdict et sentence (si applicable) */}
        <div className="space-y-4 border-b border-border/40 pb-4">
          <h3 className="text-sm font-medium">{t("verdictAndSentence")}</h3>
          
          <FormField
            control={form.control}
            name="verdict"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("verdict")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("verdictPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sentenceDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sentenceDetails")}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={3} 
                    placeholder={t("sentenceDetailsPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Créateur du dossier */}
        <div className="space-y-4 border-b border-border/40 pb-4">
          <h3 className="text-sm font-medium">{t("caseCreator")}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="createdByName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("createdByName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="createdByDept"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("createdByDept")}</FormLabel>
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
        
        {/* Options de confidentialité */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t("privacyOptions")}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isSealed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("isSealed")}</FormLabel>
                    <div className="text-muted-foreground text-xs">
                      {t("isSealedDescription")}
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
              name="isSensitive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("isSensitive")}</FormLabel>
                    <div className="text-muted-foreground text-xs">
                      {t("isSensitiveDescription")}
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
          </div>
        </div>
      
      <div className="mt-6 flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {tCommon("cancel")}
          </Button>
        )}
        <LoadingButton type="submit" loading={isSubmitting}>
          {initialData ? t("updateCase") : t("createCase")}
        </LoadingButton>
      </div>
    </Form>
  );
} 