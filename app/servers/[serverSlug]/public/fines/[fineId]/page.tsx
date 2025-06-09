import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PiggyBank,
  DollarSignIcon,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  ClipboardList,
  Car,
} from "lucide-react";
import formatCurrency from "@/lib/format/currency";
import { processFineAction } from "./action";

type PageProps = {
  params: {
    serverSlug: string;
    fineId: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function SingleFinePage({
  params,
  searchParams,
}: PageProps) {
  const paramsData = await params;
  const searchParamsData = await searchParams;

  const { fineId, serverSlug } = paramsData;
  const t = await getTranslations("Fines");
  const success = searchParamsData.success as string | undefined;

  // Vérifier d'abord que le serveur existe
  const server = await prisma.organization.findUnique({
    where: { slug: serverSlug },
    select: { id: true },
  });

  if (!server) {
    notFound();
  }

  // Récupérer les données de l'amende
  const fine = await prisma.fine.findUnique({
    where: { id: fineId },
    include: {
      citizen: true,
      penalCode: true,
      vehicle: true,
    },
  });

  if (!fine) {
    notFound();
  }

  // Si l'amende a déjà été payée ou contestée, on le montre
  const isPending = fine.status === "PENDING";

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="border-amber-200 bg-amber-500/15 text-amber-600 hover:bg-amber-500/20">
            {t("status.pending")}
          </Badge>
        );
      case "PAID":
        return (
          <Badge className="border-green-200 bg-green-500/15 text-green-600 hover:bg-green-500/20">
            {t("status.paid")}
          </Badge>
        );
      case "CONTESTED":
        return (
          <Badge className="border-red-200 bg-red-500/15 text-red-600 hover:bg-red-500/20">
            {t("status.contested")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-muted/30 border-b p-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <PiggyBank className="text-primary h-6 w-6" />
            {t("singleFineTitle")}
          </CardTitle>
          <CardDescription className="mt-1">
            {t("singleFineDescription")}
          </CardDescription>
          {success && (
            <div
              className={`mt-4 rounded-md p-3 ${
                success === "pay"
                  ? "border border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
                  : "border border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400"
              }`}
            >
              {success === "pay"
                ? t("paymentSuccessful")
                : t("contestSuccessful")}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {/* Montant et statut en évidence */}
          <div className="bg-primary/5 flex items-center justify-between border-b p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                {t("amount")}
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(fine.amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground mb-1 text-sm font-medium">
                {t("statusLabel")}
              </p>
              <div>
                {renderStatus(fine.status)}
                {fine.status === "PAID" && fine.paidAt && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    {t("paidOn")} {formatDate(fine.paidAt)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Détails de l'amende */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-6">
                {/* Infraction */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <ClipboardList className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">
                      {t("offense")}
                    </h3>
                    <p className="font-medium">{fine.reason}</p>
                    {fine.penalCode?.description && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {fine.penalCode.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Véhicule impliqué */}
                {fine.vehicle && (
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      <Car className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-muted-foreground text-sm font-medium">
                        {t("involvedVehicle")}
                      </h3>
                      <p className="font-medium">
                        {fine.vehicle.make} {fine.vehicle.model}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {fine.vehicle.licensePlate} - {fine.vehicle.color}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <Calendar className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">
                      {t("date")}
                    </h3>
                    <p className="font-medium">{formatDate(fine.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Lieu */}
                {fine.location && (
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      <MapPin className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-muted-foreground text-sm font-medium">
                        {t("location")}
                      </h3>
                      <p className="font-medium">{fine.location}</p>
                    </div>
                  </div>
                )}

                {/* Agent */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <User className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">
                      {t("issuedBy")}
                    </h3>
                    <p className="font-medium">{fine.issuedByName}</p>
                  </div>
                </div>

                {/* Points de permis et temps de prison si applicable */}
                <div className="space-y-3">
                  {fine.licensePoints && fine.licensePoints > 0 && (
                    <div className="bg-muted/30 rounded-md p-3">
                      <h3 className="text-muted-foreground text-sm font-medium">
                        {t("licensePoints")}
                      </h3>
                      <p className="font-medium">
                        -{fine.licensePoints} points
                      </p>
                    </div>
                  )}

                  {typeof fine.jailTime === "number" && fine.jailTime > 0 && (
                    <div className="bg-muted/30 rounded-md p-3">
                      <h3 className="text-muted-foreground text-sm font-medium">
                        {t("jailTime")}
                      </h3>
                      <p className="font-medium">
                        {fine.jailTime} {t("minutes")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {fine.notes && (
              <div className="mt-6 border-t pt-4">
                <h3 className="mb-2 font-medium">{t("notes")}</h3>
                <div className="text-muted-foreground bg-muted/30 rounded-md p-3 text-sm whitespace-pre-wrap">
                  {fine.notes}
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          {isPending && (
            <div className="bg-muted/10 border-t p-4">
              <div className="flex items-center justify-end gap-3">
                <form action={processFineAction} className="w-[120px]">
                  <input type="hidden" name="fineId" value={fine.id} />
                  <input type="hidden" name="action" value="contest" />
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full border-red-200 bg-white font-medium text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {t("contest")}
                  </Button>
                </form>
                <form action={processFineAction} className="w-[120px]">
                  <input type="hidden" name="fineId" value={fine.id} />
                  <input type="hidden" name="action" value="pay" />
                  <Button
                    type="submit"
                    className="w-full bg-green-600 font-medium text-white hover:bg-green-700"
                  >
                    <DollarSignIcon className="mr-2 h-4 w-4" />
                    {t("pay")}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-muted-foreground bg-muted/10 border-t py-4 text-xs">
          {t("privacyNotice")}
        </CardFooter>
      </Card>
    </div>
  );
}
