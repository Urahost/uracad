import { Error401 } from "@/features/page/error-401";
import { Layout } from "@/features/page/layout";
import { useTranslations } from "next-intl";

export default function UnauthorizedPage() {
  const t = useTranslations("Server");
  
  return (
    <Layout size="lg">
      <Error401 title={t("unauthorized")} />
    </Layout>
  );
}
