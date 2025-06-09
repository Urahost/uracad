import { buttonVariants } from "@/components/ui/button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { hasPermission } from "@/lib/auth/auth-org";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Car, 
  FileText, 
  ShieldAlert, 
  BadgeDollarSign,
  BadgeAlert,
  ShieldCheck,
  Folder,
  AlertTriangle
} from "lucide-react";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import CheckPermission from "./permissions/check-permissions";
import { ActiveOfficersSection } from "../_activeOfficers/active-officers";


export default async function RoutePage() {
  const server = await getRequiredCurrentServerCache();
  
  
  const organization = await prisma.organization.findFirst({
    where: {
      slug: server.slug,
    },
  });
  
  if (!organization) {
    return (
      <Layout size="lg">
        <LayoutHeader>
          <LayoutTitle>Tableau de bord</LayoutTitle>
        </LayoutHeader>
        <LayoutContent>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Serveur non trouvé</h2>
            <p className="mt-2 text-muted-foreground">Impossible de trouver les données pour ce serveur.</p>
          </div>
        </LayoutContent>
      </Layout>
    );
  }
  
  const organizationId = organization.id;
  
  // Récupérer les statistiques avec l'ID correct
  const citizenCount = await prisma.citizen.count({
    where: { organizationId }
  });
  
  const vehicleCount = await prisma.vehicle.count({
    where: { organizationId }
  });
  
  const warrantCount = await prisma.warrant.count({
    where: { 
      organizationId,
      status: { in: ["ACTIVE", "PENDING", "APPROVED"] }
    }
  });
  
  const judicialCaseCount = await prisma.judicialCase.count({
    where: { organizationId }
  });
  
  const pendingFineCount = await prisma.fine.count({
    where: { 
      organizationId,
      status: "PENDING"
    }
  });
  
  const paidFineCount = await prisma.fine.count({
    where: { 
      organizationId,
      status: "PAID"
    }
  });
  
  const contestedFineCount = await prisma.fine.count({
    where: { 
      organizationId,
      status: "CONTESTED"
    }
  });
  
  const medicalRecordCount = await prisma.medicalRecord.count({
    where: { organizationId }
  });

  // Récupérer les officiers actifs
  const activeOfficers = await prisma.activeOfficer.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Tableau de bord</LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        {(await hasPermission({
          member: ["create"],
        })) ? (
          <Link
            href={`/servers/${server.slug}/settings/members`}
            className={buttonVariants({ variant: "outline" })}
          >
            Inviter un membre
          </Link>
        ) : null}
      </LayoutActions>
      <LayoutContent className="flex flex-col gap-4 lg:gap-8">
        {/* Grille de style Bento pour les statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Carte des citoyens */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5" /> 
                Citoyens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{citizenCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Personnes enregistrées
              </p>
            </CardContent>
          </Card>
          
          {/* Carte des véhicules */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Car className="h-5 w-5" /> 
                Véhicules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{vehicleCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Véhicules enregistrés
              </p>
            </CardContent>
          </Card>
          
          {/* Carte des amendes */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800 md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BadgeDollarSign className="h-5 w-5" /> 
                Amendes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-3xl font-bold">{pendingFineCount}</div>
                  <div className="flex items-center text-amber-600 text-sm">
                    <BadgeAlert className="h-4 w-4 mr-1" />
                    En attente
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{paidFineCount}</div>
                  <div className="flex items-center text-green-600 text-sm">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Payées
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{contestedFineCount}</div>
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Contestées
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Carte des mandats */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> 
                Mandats actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{warrantCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Mandats en cours
              </p>
            </CardContent>
          </Card>
          
          {/* Carte des cas judiciaires */}
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Folder className="h-5 w-5" /> 
                Dossiers judiciaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{judicialCaseCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Affaires judiciaires
              </p>
            </CardContent>
          </Card>
          
          {/* Carte des dossiers médicaux */}
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 border-teal-200 dark:border-teal-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5" /> 
                Dossiers médicaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{medicalRecordCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Dossiers médicaux créés
              </p>
            </CardContent>
          </Card>
        </div>
        <CheckPermission
          permissions={["VIEW_LEO"]}
          fallback={<div>Vous n'avez pas les permissions pour voir les officiers actifs.</div>}
        >
          <ActiveOfficersSection 
            officers={activeOfficers} 
            organizationId={organizationId} 
          />
        </CheckPermission>
      </LayoutContent>
    </Layout>
  );
}
