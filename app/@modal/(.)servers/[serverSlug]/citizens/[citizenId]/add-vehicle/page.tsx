import { notFound } from "next/navigation";
import AddVehicleModal from "../../../../../../servers/[serverSlug]/(navigation)/citizens/vehicles/add-vehicle-modal";
import CheckPermission from "../../../../../../servers/[serverSlug]/(navigation)/permissions/check-permissions";
import { prisma } from "@/lib/prisma";

export default async function AddVehiclePage({
  params,
}: {
  params: { serverSlug: string; citizenId: string };
}) {
  const { serverSlug, citizenId } = await params;
  const citizen = await prisma.citizen.findFirst({
    where: {
      id: citizenId,
      organization: {
        slug: serverSlug, 
      },
    },
  });

  if (!citizen) {
    notFound();
  }

  const citizenName = `${citizen.name} ${citizen.surname}`;

  return (
    <CheckPermission
      permissions={["CREATE_VEHICLE"]}
      mode="OR"
    >
      <AddVehicleModal citizenId={citizen.id} citizenName={citizenName} />
    </CheckPermission>
  );
}
 