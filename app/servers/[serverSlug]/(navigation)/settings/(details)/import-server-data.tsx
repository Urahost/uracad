"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { importQBCoreData, importESXData } from "./actions/import-server-actions";
import { ApiPreview } from "./api-preview";

type ImportServerDataProps = {
  organizationId: string;
};

export const ImportServerData = ({ organizationId }: ImportServerDataProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importType, setImportType] = useState<string | null>(null);

  const handleImport = async (type: 'qbcore' | 'esx') => {
    setIsImporting(true);
    setImportType(type);
    
    try {
      let result;
      if (type === 'qbcore') {
        result = await importQBCoreData(organizationId);
      } else {
        result = await importESXData(organizationId);
      }
      
      if (result.success) {
        toast.success(`Import ${type.toUpperCase()} réussi! ${result.citizensCreated} citoyens et ${result.vehiclesCreated} véhicules créés.`);
      } else {
        toast.error(`Erreur lors de l'import ${type.toUpperCase()}: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Erreur lors de l'import ${type.toUpperCase()}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsImporting(false);
      setImportType(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer les données</CardTitle>
        <CardDescription>
          Importez automatiquement les citoyens et véhicules depuis votre serveur FiveM
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center mb-4">
          <ApiPreview />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={async () => handleImport('qbcore')}
            disabled={isImporting}
            className="flex-1"
            variant="outline"
          >
            {isImporting && importType === 'qbcore' ? 'Import en cours...' : 'Importer QBCore'}
          </Button>
          <Button
            onClick={async () => handleImport('esx')}
            disabled={isImporting}
            className="flex-1"
            variant="outline"
          >
            {isImporting && importType === 'esx' ? 'Import en cours...' : 'Importer ESX'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Cette action importera tous les citoyens et leurs véhicules depuis votre serveur FiveM.
          Les données existantes ne seront pas écrasées.
        </p>
      </CardContent>
    </Card>
  );
}; 