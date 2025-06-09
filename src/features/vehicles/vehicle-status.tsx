import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type VehicleStatusProps = {
  status: string;
  className?: string;
};

export function VehicleStatus({ status, className }: VehicleStatusProps) {
  const t = useTranslations("Vehicles");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          text: t("status.active"),
          color: "text-green-600 bg-green-50",
        };
      case "STOLEN":
        return {
          text: t("status.stolen"),
          color: "text-red-600 bg-red-50",
        };
      case "IMPOUNDED":
        return {
          text: t("status.impounded"),
          color: "text-amber-600 bg-amber-50",
        };
      case "DESTROYED":
        return {
          text: t("status.destroyed"),
          color: "text-slate-600 bg-slate-100",
        };
      default:
        return {
          text: status,
          color: "text-slate-600 bg-slate-100",
        };
    }
  };

  const { text, color } = getStatusConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        color,
        className
      )}
    >
      {text}
    </span>
  );
} 