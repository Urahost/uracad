import { Layout, LayoutHeader, LayoutTitle, LayoutContent } from "@/features/page/layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function FormSuccessPage() {
  return (
    <Layout size="sm" className="flex mx-auto">
      <LayoutHeader className="flex flex-col items-center justify-center gap-2">
        <CheckCircle2 className="text-green-500 w-12 h-12" />
        <LayoutTitle>Réponse envoyée !</LayoutTitle>
        <p className="text-muted-foreground text-center max-w-md">
          Merci d'avoir répondu à ce formulaire. Votre réponse a bien été prise en compte.
        </p>
      </LayoutHeader>
      <LayoutContent className="flex flex-col items-center">
        <Button asChild variant="outline">
          <Link href="./">Retour au formulaire</Link>
        </Button>
      </LayoutContent>
    </Layout>
  );
}
