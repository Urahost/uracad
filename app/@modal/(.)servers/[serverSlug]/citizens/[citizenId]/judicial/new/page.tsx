"use client";

import { useRouter } from "next/navigation";
import { JudicialCaseModal } from "../../../../../../../servers/[serverSlug]/(navigation)/citizens/[citizenId]/judicial/judicial-case-modal";

export default function NewJudicialCasePage({
  params
}: {
  params: { serverSlug: string; citizenId: string }
}) {
  const router = useRouter();
  
  return (
    <JudicialCaseModal
      open={true}
      onOpenChange={(open) => !open && router.back()}
      citizenId={params.citizenId}
    />
  );
} 