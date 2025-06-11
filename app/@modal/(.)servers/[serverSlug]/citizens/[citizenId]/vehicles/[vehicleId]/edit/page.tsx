
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditVehicleModal from "../../../../../../../../servers/[serverSlug]/(navigation)/citizens/vehicles/edit-vehicle-modal";
import CheckPermission from "../../../../../../../../servers/[serverSlug]/(navigation)/permissions/check-permissions";

export default async function EditVehiclePage({
  params,
}: {
  params: { serverSlug: string; citizenId: string; vehicleId: string };
}) {
  const { serverSlug, citizenId, vehicleId } = await params;
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      citizenId: citizenId,
      citizen: {
        organization: {
          slug: serverSlug,
        },
      },
    },
    include: {
      citizen: true,
    },
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <CheckPermission
      permissions={["EDIT_VEHICLE"]}
      mode="OR"
    >
      <EditVehicleModal vehicle={vehicle} citizenName={vehicle.citizen.name} />
    </CheckPermission>
  );
} 