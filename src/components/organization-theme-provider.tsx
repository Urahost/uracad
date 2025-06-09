"use client";

import { useEffect, useMemo } from "react";
import { themes, applyTheme } from "@/lib/themes";
import { useTheme } from "next-themes";
import { logger } from "@/lib/logger";

type OrganizationThemeProviderProps = {
  metadata?: string | null;
  children: React.ReactNode;
};

// Créer un singleton pour stocker l'état du thème globalement
const themeState = {
  applied: false,
  lastTheme: null as string | null,
};

export function OrganizationThemeProvider({ metadata, children }: OrganizationThemeProviderProps) {
  const { resolvedTheme } = useTheme();
  
  // Utiliser useMemo pour éviter les re-renders inutiles
  const themeInfo = useMemo(() => {
    try {
      const parsedMetadata = metadata ? JSON.parse(metadata) : null;
      const themeName = typeof parsedMetadata?.colorsTheme === 'string' ? parsedMetadata.colorsTheme : "Default";
      const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase()) ?? themes[0];
      return { themeName, theme, parsedMetadata };
    } catch (error) {
      logger.error("[OrganizationThemeProvider] Error parsing metadata:", error);
      return { themeName: "Default", theme: themes[0], parsedMetadata: null };
    }
  }, [metadata]);

  useEffect(() => {
    // Log pour déboguer
    logger.info("[OrganizationThemeProvider] Effect triggered:", {
      metadata,
      resolvedTheme,
      themeApplied: themeState.applied,
      lastTheme: themeState.lastTheme,
      currentThemeInfo: themeInfo
    });

    // Si les métadonnées sont undefined et qu'un thème a déjà été appliqué, ne rien faire
    if (metadata === undefined && themeState.applied) {
      logger.info("[OrganizationThemeProvider] Skipping theme application - metadata is undefined and theme already applied");
      return;
    }

    // Si le thème n'a pas changé et a déjà été appliqué, ne rien faire
    if (themeInfo.themeName === themeState.lastTheme && themeState.applied) {
      logger.info("[OrganizationThemeProvider] Skipping theme application - theme unchanged");
      return;
    }

    try {
      // Appliquer le thème avec la version light/dark appropriée
      const isDark = resolvedTheme === 'dark';
      logger.info("[OrganizationThemeProvider] Applying theme:", {
        theme: themeInfo.theme.name,
        isDark,
        resolvedTheme
      });
      
      applyTheme(themeInfo.theme, isDark);
      
      // Mettre à jour l'état global
      themeState.lastTheme = themeInfo.themeName;
      themeState.applied = true;
      
      logger.info("[OrganizationThemeProvider] Theme application complete");
    } catch (error) {
      logger.error("[OrganizationThemeProvider] Error applying theme:", error);
      // En cas d'erreur, appliquer le thème par défaut
      const defaultTheme = themes[0];
      const isDark = resolvedTheme === 'dark';
      applyTheme(defaultTheme, isDark);
      themeState.lastTheme = "Default";
      themeState.applied = true;
    }
  }, [metadata, resolvedTheme, themeInfo]);

  return <>{children}</>;
} 