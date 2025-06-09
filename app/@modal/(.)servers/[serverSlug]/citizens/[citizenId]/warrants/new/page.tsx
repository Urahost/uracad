"use client";

import { useRouter } from "next/navigation";
import { WarrantModal } from "../../../../../../../servers/[serverSlug]/(navigation)/citizens/[citizenId]/warrant/warrant-modal";

export default function NewWarrantPage({
  params
}: {
  params: { serverSlug: string; citizenId: string }
}) {
  const router = useRouter();
  
  return (
    <WarrantModal
      open={true}
      onOpenChange={(open) => !open && router.back()}
      citizenId={params.citizenId}
      judicialCases={[]} // Les cas judiciaires seront chargés dans le composant WarrantModal
    />
  );
} 