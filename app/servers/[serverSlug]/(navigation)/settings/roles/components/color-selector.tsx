"use client";

import { CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

type ColorSelectorProps = {
  selectedColor: string;
  onChange: (color: string) => void;
}

export function ColorSelector({ selectedColor, onChange }: ColorSelectorProps) {
  const colors = [
    "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#e91e63",
    "#f1c40f", "#e67e22", "#e74c3c", "#95a5a6", "#607d8b",
    "#11806a", "#1f8b4c", "#206694", "#71368a", "#ad1457",
    "#c27c0e", "#a84300", "#992d22", "#979c9f", "#546e7a"
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-md border"
          style={{ backgroundColor: selectedColor }}
        />
        <div className="flex-1">
          <Input 
            type="text" 
            value={selectedColor} 
            onChange={(e) => onChange(e.target.value)}
            placeholder="#HEX"
            className="font-mono"
          />
        </div>
        <Input 
          type="color" 
          value={selectedColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 p-1 cursor-pointer"
        />
      </div>
      <div className="grid grid-cols-10 gap-2">
        {colors.map(color => (
          <button
            key={color}
            type="button"
            className={`w-6 h-6 rounded-md cursor-pointer flex items-center justify-center ${
              selectedColor.toLowerCase() === color.toLowerCase() ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          >
            {selectedColor.toLowerCase() === color.toLowerCase() && 
              <CheckIcon className="h-3 w-3 text-white" />
            }
          </button>
        ))}
      </div>
    </div>
  );
} 