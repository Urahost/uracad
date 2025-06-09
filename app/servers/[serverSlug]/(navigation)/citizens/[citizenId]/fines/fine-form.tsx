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
import { FineCreateSchema } from "./fines.schema";
import { getPenalCodesAction } from "./penal-code.action";
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
import { getDepartments, type Department } from "./departments.action";
import { getCurrentUserInfo } from "./current-user.action";

type FineFormValues = z.infer<typeof FineCreateSchema>;

type PenalCodeOption = {
  id: string;
  code: string;
  description: string;
  category: string;
  minFine: number;
  maxFine: number;
  licensePoints: number | null;
  jailTime: number | null;
};

type VehicleOption = {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  year?: number | null;
};

type FineFormProps = {
  citizenId: string;
  submitForm: (data: FineFormValues) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  currentLicensePoints?: number;
  vehicles: VehicleOption[];
};

export function FineForm({
  citizenId,
  submitForm,
  isSubmitting,
  onCancel,
  currentLicensePoints = 12,
  vehicles = [],
}: FineFormProps) {
  const t = useTranslations("Fines");
  const tCommon = useTranslations("Common");
  const tVehicles = useTranslations("Vehicles");
  const [penalCodes, setPenalCodes] = useState<PenalCodeOption[]>([]);
  const [allPenalCodes, setAllPenalCodes] = useState<PenalCodeOption[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTrafficOffense, setIsTrafficOffense] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] =
    useState<boolean>(true);
  const [currentUserInfo, setCurrentUserInfo] = useState<{ name: string; departmentId: string | null }>({
    name: "",
    departmentId: null
  });

  const form = useZodForm({
    schema: FineCreateSchema,
    defaultValues: {
      citizenId,
      amount: 0,
      reason: "",
      location: "",
      notes: "",
      licensePoints: 0,
      jailTime: 0,
      issuedByName: "",
      issuedByDept: "",
      status: "PENDING",
      penalCodeId: "",
      vehicleId: ""
    },
  });

  // Détecter si la catégorie actuelle est liée au trafic
  useEffect(() => {
    if (selectedCategory) {
      // Vérifier si la catégorie contient "traffic" ou "trafic" (insensible à la casse)
      const isTraffic =
        selectedCategory.toLowerCase().includes("traffic") ||
        selectedCategory.toLowerCase().includes("trafic");

      setIsTrafficOffense(isTraffic);

      // Si on passe d'une catégorie trafic à une autre catégorie, réinitialiser vehicleId
      if (!isTraffic && form.getValues("vehicleId")) {
        form.setValue("vehicleId", undefined);
      }
    } else {
      setIsTrafficOffense(false);
    }
  }, [selectedCategory, form]);

  // Charger les infractions du code pénal
  useEffect(() => {
    const loadPenalCodes = async () => {
      setIsLoading(true);
      try {
        const result = await getPenalCodesAction({
          category:
            selectedCategory === "_ALL_"
              ? undefined
              : (selectedCategory ?? undefined),
        });
        if (result?.data) {
          setAllPenalCodes(result.data.penalCodes);
          setCategories(result.data.categories);

          // Filtrer les codes selon la catégorie sélectionnée
          if (selectedCategory && selectedCategory !== "_ALL_") {
            const filteredCodes = result.data.penalCodes.filter(
              (code) => code.category === selectedCategory,
            );
            setPenalCodes(filteredCodes);

            // Sélectionner automatiquement le premier code de la catégorie
            if (filteredCodes.length > 0 && !form.watch("penalCodeId")) {
              handlePenalCodeSelect(filteredCodes[0].id);
            }
          } else {
            setPenalCodes(result.data.penalCodes);
          }
        }

        // Si aucune catégorie n'est disponible, afficher des exemples par défaut
        if (!result?.data || result.data.penalCodes.length === 0) {
          // Catégories par défaut
          const defaultCategories = [
            "Traffic",
            "Alcool",
            "Drogue",
            "Violence",
            "Vol",
          ];
          setCategories(defaultCategories);

          // Exemples d'infractions par défaut
          const defaultPenalCodes: PenalCodeOption[] = [
            {
              id: "traffic-1",
              code: "T-101",
              description: "Excès de vitesse (0-30 km/h)",
              category: "Traffic",
              minFine: 120,
              maxFine: 200,
              licensePoints: 1,
              jailTime: null,
            },
            {
              id: "traffic-2",
              code: "T-102",
              description: "Excès de vitesse (31-50 km/h)",
              category: "Traffic",
              minFine: 250,
              maxFine: 400,
              licensePoints: 3,
              jailTime: null,
            },
            {
              id: "traffic-3",
              code: "T-103",
              description: "Excès de vitesse (51+ km/h)",
              category: "Traffic",
              minFine: 450,
              maxFine: 800,
              licensePoints: 6,
              jailTime: 30,
            },
            {
              id: "alcohol-1",
              code: "A-101",
              description: "Conduite sous influence (alcool)",
              category: "Alcool",
              minFine: 400,
              maxFine: 800,
              licensePoints: 6,
              jailTime: 60,
            },
            {
              id: "drug-1",
              code: "D-101",
              description: "Possession de stupéfiants",
              category: "Drogue",
              minFine: 300,
              maxFine: 500,
              licensePoints: 0,
              jailTime: 45,
            },
          ];

          setAllPenalCodes(defaultPenalCodes);

          // Filtrer par catégorie si déjà sélectionnée
          if (selectedCategory && selectedCategory !== "_ALL_") {
            const filteredCodes = defaultPenalCodes.filter(
              (code) => code.category === selectedCategory,
            );
            setPenalCodes(filteredCodes);

            // Sélectionner le premier code
            if (filteredCodes.length > 0) {
              handlePenalCodeSelect(filteredCodes[0].id);
            }
          } else {
            setPenalCodes(defaultPenalCodes);
          }
        }
      } catch (error) {
        logger.error("Failed to load penal codes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPenalCodes();
  }, [selectedCategory, form]);

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
          const userDeptExists = depts.some(dept => dept.id === currentUserInfo.departmentId);
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

  // Gestion de la sélection d'une catégorie
  const handleCategorySelect = (value: string) => {
    // Gestion de la catégorie "Toutes"
    if (value === "_ALL_") {
      setSelectedCategory(null);
      setPenalCodes(allPenalCodes);
      return;
    }

    setSelectedCategory(value);

    // Filtrer les codes selon la catégorie sélectionnée
    const filteredCodes = allPenalCodes.filter(
      (code) => code.category === value,
    );
    setPenalCodes(filteredCodes);

    // Sélectionner automatiquement le premier code de la catégorie
    if (filteredCodes.length > 0) {
      handlePenalCodeSelect(filteredCodes[0].id);
    }
  };

  // Gestion de la sélection d'une infraction du code pénal
  const handlePenalCodeSelect = (penalCodeId: string) => {
    const selectedCode = [...allPenalCodes, ...penalCodes].find(
      (code) => code.id === penalCodeId,
    );
    if (selectedCode) {
      // Calculer une amende par défaut (moyenne entre min et max)
      const defaultAmount = Math.round(
        (selectedCode.minFine + selectedCode.maxFine) / 2,
      );

      // Mettre à jour le formulaire avec les valeurs de l'infraction
      form.setValue("penalCodeId", selectedCode.id);
      form.setValue("amount", defaultAmount);
      form.setValue("reason", selectedCode.description);
      form.setValue("licensePoints", selectedCode.licensePoints ?? 0);
      form.setValue("jailTime", selectedCode.jailTime ?? 0);

      // Vérifier si c'est une infraction de trafic
      const isTraffic =
        selectedCode.category.toLowerCase().includes("traffic") ||
        selectedCode.category.toLowerCase().includes("trafic");

      setIsTrafficOffense(isTraffic);
    }
  };

  const handleSubmit = async (values: FineFormValues) => {
    try {
      // Convert "none" value to undefined/null for vehicleId
      if (values.vehicleId === "none") {
        values.vehicleId = undefined;
      }

      await submitForm(values);
    } catch (error) {
      logger.error("Error submitting fine form:", error);
      toast.error(t("actions.addError"));
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <div className="max-h-[70vh] space-y-6 px-1">
        {/* Section Code Pénal et Véhicule */}
        <div className="border-border/40 space-y-2 border-b pb-2">
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-2 text-sm font-medium">{t("penalCode")}</h3>
              <div className="flex justify-between gap-4">
                <Select
                  onValueChange={handleCategorySelect}
                  value={selectedCategory ?? "_ALL_"}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_ALL_">{t("allCategories")}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={handlePenalCodeSelect}
                  value={form.watch("penalCodeId") ?? "_NONE_"}
                  disabled={isLoading || penalCodes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectOffense")} />
                  </SelectTrigger>
                  <SelectContent>
                    {penalCodes.map((code) => (
                      <SelectItem key={code.id} value={code.id}>
                        {code.code} - {code.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Véhicule impliqué */}
            <div className="flex-1">
              <h3 className="mb-2 text-sm font-medium">
                {t("involvedVehicle")}
              </h3>
              {isTrafficOffense ? (
                vehicles.length > 0 ? (
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectVehicle")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              {tCommon("selectType")}
                            </SelectItem>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.make} {vehicle.model} -{" "}
                                {vehicle.licensePlate} ({vehicle.color})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="bg-muted/40 text-muted-foreground rounded-md border border-dashed p-3 text-sm">
                    {tVehicles("noVehicles")}
                  </div>
                )
              ) : (
                <div className="text-muted-foreground flex h-10 items-center text-sm">
                  <span>{t("selectOffense")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Détails de l'infraction */}
        <div className="border-border/40 space-y-4 border-b pb-2">
          <h3 className="text-sm font-medium">Détails de l'infraction</h3>

          {/* Montant et Raison */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("location")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Raison / Description */}
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("reason")}</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none" rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section Sanctions */}
        <div className="border-border/40 space-y-4 border-b pb-2">
          <h3 className="text-sm font-medium">Sanctions</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Points de permis */}
            <FormField
              control={form.control}
              name="licensePoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("licensePoints")}</FormLabel>
                  <div className="space-y-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        max={currentLicensePoints}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value ?? 0}
                      />
                    </FormControl>
                  </div>
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
                  <FormLabel>{t("jailTime")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      value={field.value ?? 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section Agent */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Informations agent</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Émis par */}
            <FormField
              control={form.control}
              name="issuedByName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("officerName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Département */}
            <FormField
              control={form.control}
              name="issuedByDept"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("department")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isDepartmentsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectDepartment")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isDepartmentsLoading ? (
                        <SelectItem value="loading" disabled>
                          Chargement...
                        </SelectItem>
                      ) : departments.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Aucun département disponible
                        </SelectItem>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                <FormLabel>{t("notes")}</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none" rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="border-border mt-6 flex justify-end gap-4 border-t pt-4">
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