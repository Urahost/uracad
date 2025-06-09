import { BaseNavigation } from "@/features/navigation/base-navigation";
import { Error401 } from "@/features/page/error-401";
import { Layout } from "@/features/page/layout";
import { useTranslations } from "next-intl";

export default function RoutePage() {
  const t = useTranslations("Server");
  
  return (
    <BaseNavigation>
      <Layout>
        <Error401 title={t("unauthorized")} />
      </Layout>
    </BaseNavigation>
  );
}
