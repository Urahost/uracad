import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PropsWithChildren } from "react";
import { Typography } from "../../components/uracad/typography";
import { useTranslations } from "next-intl";

type Error401Props = PropsWithChildren<{
  title?: string;
}>;

export function Error401(props: Error401Props) {
  const t = useTranslations("Errors.401");
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col">
        <Typography variant="code">{t("code")}</Typography>
        <CardTitle>{props.title ?? t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
