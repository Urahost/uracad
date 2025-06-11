
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DeleteVehicleModal from "../../../../../../../../servers/[serverSlug]/(navigation)/citizens/vehicles/delete-vehicle-modal";
import CheckPermission from "../../../../../../../../servers/[serverSlug]/(navigation)/permissions/check-permissions";

export default async function DeleteVehiclePage({
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
  });

  if (!vehicle) {
    notFound();
  }

  const vehicleInfo = `${vehicle.vehicle} (${vehicle.plate})`;

  return (
    <CheckPermission
      permissions={["DELETE_VEHICLE"]}
      mode="OR"
    >
      <DeleteVehicleModal vehicleId={vehicle.id} vehicleInfo={vehicleInfo} />
    </CheckPermission>
  );
} 