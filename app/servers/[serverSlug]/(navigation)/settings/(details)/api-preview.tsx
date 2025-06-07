"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Citizen } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

export const ApiPreview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Citizen[]>([]);

  const fetchPreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/preview-players');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? `Erreur API: ${response.status}`);
      }
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      toast.error(`Erreur lors de la récupération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={fetchPreview} disabled={isLoading}>
          {isLoading ? 'Chargement...' : 'Prévisualiser les données'}
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-none w-auto h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperçu des données de l'API</DialogTitle>
          <DialogDescription>
            Voici un aperçu des données qui seront importées depuis votre serveur
          </DialogDescription>
        </DialogHeader>
        {previewData.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ℹ️ Seuls les 10 premiers joueurs sont affichés dans cette prévisualisation. 
                L'import complet récupérera tous les joueurs disponibles.
              </p>
            </div>
            <div className="space-y-2">
              {previewData.map((player: Citizen, index: number) => {
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-1">
                      <div className="font-medium">
                        {player.name} {player.surname}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Citizen ID: {player.id}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate max-w-48">
                        {player.driversLicense}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {player.socialSecurityNumber}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 