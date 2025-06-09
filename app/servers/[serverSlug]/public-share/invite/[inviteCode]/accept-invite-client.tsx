"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type AcceptInviteButtonProps = {
  action: () => Promise<{
    error?: string;
    success?: boolean;
    serverSlug?: string;
    needsAuth?: boolean;
    callbackUrl?: string;
  }>;
};

export function AcceptInviteButton({ action }: AcceptInviteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsLoading(true);
    
    try {
      const result = await action();
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.needsAuth && result.callbackUrl) {
        // Redirection vers la page de connexion avec un callback
        router.push(`/auth/signin?callbackUrl=${result.callbackUrl}`);
      } else if (result.success && result.serverSlug) {
        toast.success("You have successfully joined the server!");
        // Redirection vers la page du serveur
        router.push(`/servers/${result.serverSlug}`);
      }
    } catch (error) {
      logger.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAccept} 
      className="w-full" 
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Accept Invitation"}
    </Button>
  );
} 