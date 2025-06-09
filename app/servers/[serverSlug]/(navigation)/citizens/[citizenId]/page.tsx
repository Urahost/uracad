import type { PageParams } from "@/types/next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import CheckPermission from "../../permissions/check-permissions";
import { CreateMedicalRecordForm } from "../_components/create-medical-record-form";
import { DeleteRecordModal } from "../ems/records/delete-record-modal";
import { EditRecordModal } from "../ems/records/edit-record-modal";
import VehiclesSection from "./vehicles-section";
import { getTranslations } from "next-intl/server";
import FinesSection from "./fines-section";
import { Progress } from "@/components/ui/progress";
import { FileText, ShieldCheck } from "lucide-react";
import Image from "next/image";
import JudicialCasesSection from "./judicial/judicial-cases-section";
import type { JudicialCase } from "./judicial/judicial-cases-section";
import WarrantsSection from "./warrant/warrants-section";
import type { Warrant } from "./warrant/warrants-section";

function ActionsCheck({ children }: { children: React.ReactNode }) {
  return (
    <CheckPermission permissions={["EDIT_EMS", "DELETE_EMS"]} mode="OR">
      {children}
    </CheckPermission>
  );
}

export default async function CitizenPage({
  params,
}: PageParams<{ citizenId: string; serverSlug: string }>) {
  const citizenId = (await params).citizenId;
  const serverSlug = (await params).serverSlug;
  const t = await getTranslations("Citizens");
  const tEMS = await getTranslations("EMS");
  const tCommon = await getTranslations("Common");
  const citizen = await prisma.citizen.findUnique({
    where: { id: citizenId },
    include: {
      medicalRecords: {
        orderBy: { createdAt: "desc" },
      },
      vehicles: {
        orderBy: { createdAt: "desc" },
      },
      fines: {
        orderBy: { createdAt: "desc" },
        include: {
          penalCode: {
            select: {
              code: true,
              description: true,
            },
          },
        },
      },
      judicialCases: {
        orderBy: { createdAt: "desc" },
      },
      warrants: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!citizen) {
    notFound();
  }

  // Calculate license points for display
  const licensePoints = citizen.driversLicensePoints;
  const maxLicensePoints = 12;
  const pointsPercentage = (licensePoints / maxLicensePoints) * 100;

  // Function to render license status
  const renderLicenseStatus = (status: string | null) => {
    if (!status) return null;
    
    if (status === "Valid") {
      return (
        <div className="px-3 py-2 rounded-md flex items-center bg-green-500/10 text-green-600 border border-green-500/20 justify-between">
          <span className="px-2 py-0.5">Valide</span>
        </div>
      );
    } else if (status === "Suspended") {
      return (
        <div className="px-3 py-2 rounded-md flex items-center bg-amber-500/10 text-amber-600 border border-amber-500/20 justify-between">
          <span className="px-2 py-0.5">Suspendu</span>
        </div>
      );
    } else {
      return (
        <div className="px-3 py-2 rounded-md flex items-center bg-red-500/10 text-red-600 border border-red-500/20 justify-between">
          <span className="px-2 py-0.5">Révoqué</span>
        </div>
      );
    }
  };

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>
          {citizen.name} {citizen.surname}
        </LayoutTitle>
        <LayoutDescription>
          SSN: {citizen.socialSecurityNumber ?? "N/A"} • {t("details.born")}{" "}
          {new Date(citizen.dateOfBirth).toLocaleDateString()} •{" "}
          {citizen.gender}
        </LayoutDescription>
      </LayoutHeader>

      <LayoutContent>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Première rangée : Informations personnelles et points de permis */}
          <Card className="md:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{t("personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="h-32 w-32 rounded-lg flex items-center justify-center overflow-hidden">
                  {citizen.image ? (
                    <img
                      src={citizen.image}
                      alt={`${citizen.name} ${citizen.surname}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Image 
                        src="/images/fingerprint.png" 
                        alt="Identity" 
                        width={80} 
                        height={80}
                        className="opacity-70"
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm w-full">
                  <div>
                    <div className="text-muted-foreground font-medium">
                      {t("details.address")}
                    </div>
                    <div>{citizen.address}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-medium">{t("details.dateOfBirth")}</div>
                    <div>
                      {new Date().getFullYear() -
                        new Date(citizen.dateOfBirth).getFullYear()}{" "}
                      {t("details.yearsOld")}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-medium">
                      {t("details.weight")}
                    </div>
                    <div>{citizen.weight ? `${citizen.weight} kg` : "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-medium">
                      {t("details.height")}
                    </div>
                    <div>{citizen.height ? `${citizen.height} cm` : "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-medium">
                      {t("details.hairColor")}
                    </div>
                    <div>{citizen.hairColor ?? "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-medium">
                      {t("details.eyeColor")}
                    </div>
                    <div>{citizen.eyeColor ?? "N/A"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* License Points Card */}
          <Card className="md:col-span-2 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                {t("licenses.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Permis de conduire */}
                  <div className="flex flex-col">
                    <label className="text-muted-foreground text-xs mb-1">{t("licenses.driver")}</label>
                    {citizen.driversLicense ? 
                      renderLicenseStatus(citizen.driversLicense) : 
                      (
                        <div className="px-3 py-2 rounded-md border bg-red-500/10 text-red-600 border-red-500/20 flex items-center justify-between">
                          <span className="px-2 py-0.5">
                            {t("licenses.none")} 
                          </span>
                        </div>
                      )
                    }
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{t("licenses.driverPoints")}</span>
                      <span className="text-lg font-bold">{licensePoints} / {maxLicensePoints}</span>
                    </div>
                    <Progress 
                      value={pointsPercentage} 
                      className="h-3"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        "--tw-progress-color": pointsPercentage > 66 
                          ? "rgb(34, 197, 94)" 
                          : pointsPercentage > 33 
                            ? "rgb(234, 179, 8)" 
                            : "rgb(239, 68, 68)",
                      } as React.CSSProperties}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">
                      {t("licenses.pilot")}
                    </div>
                    {citizen.pilotLicense ? 
                      renderLicenseStatus(citizen.pilotLicense) : 
                      (
                        <div className="px-3 py-2 rounded-md border bg-red-500/10 text-red-600 border-red-500/20 flex items-center justify-between">
                          <span className="px-2 py-0.5">
                            {t("licenses.none")}
                          </span>
                        </div>
                      )
                    }
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">
                      {t("licenses.water")}
                    </div>
                    {citizen.waterLicense ? 
                      renderLicenseStatus(citizen.waterLicense) : 
                      (
                        <div className="px-3 py-2 rounded-md border bg-red-500/10 text-red-600 border-red-500/20 flex items-center justify-between">
                          <span className="px-2 py-0.5">
                            {t("licenses.none")}
                          </span>
                        </div>
                      )
                    }
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground text-xs mb-1">
                      {t("licenses.firearms")}
                    </div>
                    {citizen.firearmsLicense ? 
                      renderLicenseStatus(citizen.firearmsLicense) : 
                      (
                        <div className="px-3 py-2 rounded-md border bg-red-500/10 text-red-600 border-red-500/20 flex items-center justify-between">
                          <span className="px-2 py-0.5">
                            {t("licenses.none")}
                          </span>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mandats Section */}
          <CheckPermission permissions={["VIEW_WARRANT"]}>
            <Card className="md:col-span-3">
              <WarrantsSection
                warrants={citizen.warrants.map(warrant => ({
                  ...warrant,
                  title: warrant.description,
                  reason: warrant.notes ?? "",
                  address: warrant.location
                })) as unknown as Warrant[]} 
                citizenId={citizen.id}
                judicialCases={citizen.judicialCases.map(c => ({
                  id: c.id,
                  caseNumber: c.caseNumber,
                  title: c.title
                }))}
              />
            </Card>
          </CheckPermission>

          {/* Dossiers judiciaires Section */}
          <CheckPermission permissions={["VIEW_JUDICIAL_CASE"]}>
            <Card className="md:col-span-3">
              <JudicialCasesSection 
                judicialCases={citizen.judicialCases as unknown as JudicialCase[]}
                citizenId={citizen.id}
              />
            </Card>
          </CheckPermission>

          {/* Section Vehicles */}
          <CheckPermission permissions={["VIEW_VEHICLE"]}>
              <VehiclesSection 
                vehicles={citizen.vehicles} 
                citizen={citizen} 
                serverSlug={serverSlug} 
              />
          </CheckPermission>

          {/* Section Amendes */}
          <CheckPermission permissions={["VIEW_FINE"]}>
            <Card className="md:col-span-3">
              <FinesSection 
                fines={citizen.fines} 
                citizen={citizen} 
              />
            </Card>
          </CheckPermission>

          {/* Dossiers médicaux */}
          <CheckPermission permissions={["READ_EMS"]}>
            <Card className="md:col-span-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {tEMS("title")}
                </CardTitle>
                <CheckPermission permissions={["CREATE_EMS"]}>
                  <CreateMedicalRecordForm citizen={citizen} />
                </CheckPermission>
              </CardHeader>
              <CardContent>
                {citizen.medicalRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6">
                    <p className="text-center text-muted-foreground">
                      {tEMS("noRecords")}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">{tEMS("details.type")}</TableHead>
                        <TableHead className="w-[200px]">{tEMS("details.title")}</TableHead>
                        <TableHead>{tEMS("details.description")}</TableHead>
                        <TableHead className="w-[100px]">{tEMS("details.bloodGroup")}</TableHead>
                        <ActionsCheck>
                          <TableHead className="w-[100px]">{tCommon("actions")}</TableHead>
                        </ActionsCheck>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {citizen.medicalRecords.map((record) => ( 
                        <TableRow 
                          key={record.id} 
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell>
                            <Link 
                              href={`/servers/${serverSlug}/citizens/${citizenId}/ems/${record.id}`}
                              className="hover:underline block w-full h-full"
                            >
                              {record.type}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            <Link 
                              href={`/servers/${serverSlug}/citizens/${citizenId}/ems/${record.id}`}
                              className="hover:underline block w-full h-full"
                            >
                              {record.title}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            <Link 
                              href={`/servers/${serverSlug}/citizens/${citizenId}/ems/${record.id}`}
                              className="hover:underline block w-full h-full"
                            >
                              {record.description}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link 
                              href={`/servers/${serverSlug}/citizens/${citizenId}/ems/${record.id}`}
                              className="hover:underline block w-full h-full"
                            >
                              A+
                            </Link>
                          </TableCell>
                          <ActionsCheck>
                            <TableCell>
                              <div className="flex gap-2 z-10 relative">
                                <EditRecordModal record={{
                                  id: record.id,
                                  type: record.type as "CARE" | "INJURY" | "TRAUMA" | "PSYCHOLOGY" | "DEATH",
                                  title: record.title,
                                  description: record.description,
                                  isConfidential: record.isConfidential,
                                  isPoliceVisible: record.isPoliceVisible,
                                  restrictedAccess: record.restrictedAccess,
                                }} />
                                <DeleteRecordModal record={record} />
                              </div>
                            </TableCell>
                          </ActionsCheck>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </CheckPermission>
        </div>
      </LayoutContent>
    </Layout>
  );
}
