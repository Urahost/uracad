"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { themes, applyTheme } from "@/lib/themes";
import { logger } from "@/lib/logger";

type OrganizationData = {
  [key: string]: unknown;
  id: string;
  metadata: string;
};

type ThemeSelectorProps = {
  organizationId: string;
  currentTheme?: string;
};

export function ThemeSelector({ organizationId, currentTheme = "Default" }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();
  const themeAppliedRef = useRef(false);

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const mutation = useMutation({
    mutationFn: async (themeName: string) => {
      logger.info("[ThemeSelector] Updating theme to:", themeName, "for organization:", organizationId);
      const result = await authClient.organization.update({
        organizationId,
        data: {
          metadata: {
            colorsTheme: themeName,
          },
        },
      });
      logger.info("[ThemeSelector] Update result:", result);
      return result;
    },
    onMutate: async (themeName) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ["organization", organizationId] });

      // Sauvegarder l'ancienne valeur
      const previousData = queryClient.getQueryData(["organization", organizationId]);

      // Mettre à jour optimistiquement le cache
      queryClient.setQueryData(["organization", organizationId], (old: OrganizationData) => ({
        ...old,
        metadata: JSON.stringify({ colorsTheme: themeName }),
      }));

      // Appliquer le thème immédiatement
      const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase()) ?? themes[0];
      logger.info("[ThemeSelector] Applying theme:", {
        themeName,
        foundTheme: theme.name,
        isDark: resolvedTheme === 'dark'
      });
      applyTheme(theme, resolvedTheme === 'dark');
      themeAppliedRef.current = true;

      // Afficher le toast de confirmation
      toast.success(`Theme changed to ${themeName}`);

      return { previousData };
    },
    onError: (error, _, context) => {
      // En cas d'erreur, restaurer l'ancienne valeur
      if (context?.previousData) {
        queryClient.setQueryData(["organization", organizationId], context.previousData);
      }
      logger.error("[ThemeSelector] Theme update failed:", error);
      toast.error(error.message);
    },
    onSettled: () => {
      // Rafraîchir les données après la mutation
      void queryClient.invalidateQueries({ queryKey: ["organization", organizationId] });
    },
  });

  const handleThemeChange = (themeName: string) => {
    logger.info("Theme change requested:", themeName);
    setSelectedTheme(themeName);
    mutation.mutate(themeName);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <RadioGroup
          value={selectedTheme}
          onValueChange={handleThemeChange}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {themes.map((theme) => (
            <div key={theme.name}>
              <RadioGroupItem
                value={theme.name}
                id={theme.name}
                className="peer sr-only"
              />
              <Label
                htmlFor={theme.name}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: theme.light["--primary"] }}
                    />
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: theme.light["--secondary"] }}
                    />
                  </div>
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: theme.light["--background"] }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {theme.description}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
} 