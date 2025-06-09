import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CitizenNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">Citizen Not Found</h1>
        <p className="text-muted-foreground">
          The citizen you are looking for does not exist or has been deleted.
        </p>
      </div>
      <Button asChild>
        <Link href="..">Return to Citizens</Link>
      </Button>
    </div>
  );
} 