import { redirect } from "next/navigation";

export default function AddVehiclePage({
  params,
}: {
  params: { serverSlug: string; citizenId: string };
}) {
  redirect(`/servers/${params.serverSlug}/citizens/${params.citizenId}`);
} 