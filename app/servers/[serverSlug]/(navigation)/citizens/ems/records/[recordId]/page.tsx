import type { PageParams } from "@/types/next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { EditRecordModal } from "../edit-record-modal";
import { DeleteRecordModal } from "../delete-record-modal";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutTitle,
  LayoutActions,
  LayoutHeader,
} from "@/features/page/layout";
import { Badge } from "@/components/ui/badge";
import { PermissionCheck } from "../../../../permissions/permission-check";

export default async function RecordPage({
  params,
}: PageParams<{ recordId: string }>) {
  const server = await getRequiredCurrentServerCache();
  const { recordId } = await params;
  const record = await prisma.medicalRecord.findFirst({
    where: {
      id: recordId,
      citizen: {
        organizationId: server.id,
      },
    },
    include: {
      citizen: true,
    },
  });

  if (!record) {
    notFound();
  }

  return (
    <PermissionCheck
      permission="READ_EMS"
      fallback={`/servers/${server.slug}/ems`}
    >
      <Layout>
        <LayoutHeader>
          <LayoutTitle>Medical Record</LayoutTitle>
          <LayoutDescription>
            Details for {record.citizen.name} {record.citizen.lastName}
          </LayoutDescription>
        </LayoutHeader>
        <LayoutActions className="gap-2">
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
        </LayoutActions>
        <LayoutContent>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm font-semibold">
                      Name
                    </div>
                    <div>
                      {record.citizen.name} {record.citizen.lastName}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Record Details{" "}
                  <Badge
                    variant={
                      record.isConfidential ? "destructive" : "secondary"
                    }
                  >
                    {record.isConfidential ? "Confidential" : "Public"}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex flex-col gap-3">
                  <span className="text-muted-foreground text-sm">
                    Created on {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="text-muted-foreground text-sm font-semibold">
                    Type
                  </div>
                  <div className="mt-1">{record.type}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm font-semibold">
                    Description
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">
                    {record.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </LayoutContent>
      </Layout>
    </PermissionCheck>
  );
}
