import type { PageParams } from "@/types/next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  Layout, 
  LayoutContent, 
  LayoutHeader, 
  LayoutTitle, 
  LayoutDescription,
  LayoutActions
} from "@/features/page/layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ArrowLeft, Clock, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { EditRecordModal } from "../../../ems/records/edit-record-modal";
import { DeleteRecordModal } from "../records/delete-record-modal";
import CheckPermission from "../../../../permissions/check-permissions";


export default async function MedicalRecordPage({
  params,
}: PageParams<{ serverSlug: string; citizenId: string; recordId: string }>) {
  const serverSlug = (await params).serverSlug;
  const citizenId = (await params).citizenId;
  const recordId = (await params).recordId;

  // Récupérer le dossier médical avec le citoyen associé
  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
    include: {
      citizen: true,
    },
  });

  if (!record || record.citizenId !== citizenId) {
    notFound();
  }

  // Formater les types de dossiers médicaux pour l'affichage
  const recordTypeLabels = {
    CARE: "Medical Care",
    INJURY: "Injury",
    TRAUMA: "Trauma",
    PSYCHOLOGY: "Psychological Evaluation",
    DEATH: "Death Certificate",
  };

  const typeLabel = recordTypeLabels[record.type as keyof typeof recordTypeLabels] || record.type;

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Medical Record: {record.title}</LayoutTitle>
        <LayoutDescription>
          {typeLabel} • Created {format(record.createdAt, "PPP")}
        </LayoutDescription>
      </LayoutHeader>

      <LayoutActions className="flex items-center gap-2">
        <Link href={`/servers/${serverSlug}/citizens/${citizenId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Citizen
          </Button>
        </Link>
        <CheckPermission permissions={["EDIT_EMS", "DELETE_EMS"]} mode="OR">
          <div className="flex items-center gap-2">
            <EditRecordModal record={{
              id: record.id,
              type: record.type as "CARE" | "INJURY" | "TRAUMA" | "PSYCHOLOGY" | "DEATH",
              title: record.title,
              description: record.description,
              isConfidential: record.isConfidential,
              isPoliceVisible: record.isPoliceVisible,
              restrictedAccess: record.restrictedAccess,
            }} />
            <DeleteRecordModal 
              record={record}
              redirectAfterDelete={`/servers/${serverSlug}/citizens/${citizenId}`}
            />
          </div>
        </CheckPermission>
      </LayoutActions>

      <LayoutContent>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Record Details</CardTitle>
              <CardDescription>
                Complete information about this medical record
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Patient</h3>
                  <p className="text-base">
                    {record.citizen.name} {record.citizen.surname}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Record Type</h3>
                  <p className="text-base">{typeLabel}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Date Created</h3>
                  <p className="text-base">{format(record.createdAt, "PPP 'at' p")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <p className="text-base">{format(record.updatedAt, "PPP 'at' p")}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap">
                  {record.description}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center p-3 rounded-lg border">
                  <div className={`mr-3 p-2 rounded-full ${record.isConfidential ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Confidential</p>
                    <p className="text-xs text-muted-foreground">
                      {record.isConfidential ? "Yes - Limited access" : "No - Standard access"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-lg border">
                  <div className={`mr-3 p-2 rounded-full ${record.isPoliceVisible ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Police Visible</p>
                    <p className="text-xs text-muted-foreground">
                      {record.isPoliceVisible ? "Yes - Police can view" : "No - EMS only"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-lg border">
                  <div className={`mr-3 p-2 rounded-full ${record.restrictedAccess ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Restricted Access</p>
                    <p className="text-xs text-muted-foreground">
                      {record.restrictedAccess ? "Yes - Highly confidential" : "No - Standard permissions"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LayoutContent>
    </Layout>
  );
}

