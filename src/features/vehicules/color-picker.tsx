"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [value, setValue] = useState(color || "#7289da");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedValue = useRef(color);
  
  // Synchroniser l'état local quand la prop change
  useEffect(() => {
    setValue(color || "#7289da");
    lastReportedValue.current = color;
  }, [color]);
  
  // Mise à jour locale immédiate, mais throttle les mises à jour au parent
  const handleChange = (newColor: string) => {
    setValue(newColor);
    
    // Annuler tout timer existant
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Créer un nouveau timer avec un délai important
    timerRef.current = setTimeout(() => {
      if (newColor !== lastReportedValue.current) {
        onChange(newColor);
        lastReportedValue.current = newColor;
      }
    }, 1000); // Augmenter à 1000ms
  };
  
  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Input
        type="color"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-10 h-10 p-1 cursor-pointer"
      />
      <Input 
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 font-mono"
        placeholder="#HEX"
      />
    </div>
  );
} 