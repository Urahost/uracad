"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { themes, type Theme, applyTheme } from "@/lib/themes";

export function useThemeStorage(organizationId: string) {
  const { theme: mode } = useTheme();
  const isDark = mode === "dark";

  // Réappliquer le thème quand le mode change
  useEffect(() => {
    const savedThemeName = localStorage.getItem(`theme-${organizationId}`);
    if (savedThemeName) {
      const theme = themes.find((t) => t.name === savedThemeName);
      if (theme) {
        applyTheme(theme, isDark);
      }
    } else {
      // Si aucun thème n'est sauvegardé, utiliser le thème par défaut
      applyTheme(themes[0], isDark);
    }
  }, [organizationId, isDark]); // isDark est suffisant car il change quand mode change

  const saveTheme = (theme: Theme) => {
    localStorage.setItem(`theme-${organizationId}`, theme.name);
    applyTheme(theme, isDark);
  };

  return { saveTheme };
} 