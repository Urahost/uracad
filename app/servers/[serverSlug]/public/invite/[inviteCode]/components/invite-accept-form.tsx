"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type InviteAcceptFormProps = {
  code: string;
  onAccept: (code: string) => Promise<void>;
};

export function InviteAcceptForm({ code, onAccept }: InviteAcceptFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onAccept(code);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "InviteError") {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de l'acceptation de l'invitation");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto">
      <CardHeader>
        <CardTitle>Accepter l'invitation</CardTitle>
        <CardDescription>
          En acceptant cette invitation, vous rejoindrez l'organisation avec le rôle spécifié
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button 
          onClick={handleAccept} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Acceptation en cours..." : "Accepter l'invitation"}
        </Button>
      </CardContent>
    </Card>
  );
} 