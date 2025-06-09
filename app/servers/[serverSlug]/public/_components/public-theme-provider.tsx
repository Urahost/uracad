"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { themes, applyTheme } from "@/lib/themes";
import { logger } from "@/lib/logger";

type PublicThemeProviderProps = {
  metadata: string | null;
  children: React.ReactNode;
};

export function PublicThemeProvider({ metadata, children }: PublicThemeProviderProps) {
  const { resolvedTheme } = useTheme();
  const themeAppliedRef = useRef(false);

  useEffect(() => {
    // Éviter les rendus inutiles si le thème a déjà été appliqué
    if (themeAppliedRef.current) {
      return;
    }


    try {
      // Parser les métadonnées
      const parsedMetadata = metadata ? JSON.parse(metadata) : null;

      // Récupérer le nom du thème
      const themeName = parsedMetadata?.colorsTheme;

      if (typeof themeName === "string") {
        // Trouver le thème correspondant
        const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase()) ?? themes[0];

        // Appliquer le thème approprié selon le mode
        const isDark = resolvedTheme === "dark";


        applyTheme(theme, isDark);
        themeAppliedRef.current = true;
      } else {
        // Appliquer le thème par défaut
        const defaultTheme = themes[0];
        const isDark = resolvedTheme === "dark";
        applyTheme(defaultTheme, isDark);
        themeAppliedRef.current = true;
      }
    } catch (error) {
      logger.info("[PublicThemeProvider] Error applying theme:", error);
      const defaultTheme = themes[0];
      const isDark = resolvedTheme === "dark";
      applyTheme(defaultTheme, isDark);
      themeAppliedRef.current = true;
    }
  }, [metadata, resolvedTheme]);

  return <>{children}</>;
} 