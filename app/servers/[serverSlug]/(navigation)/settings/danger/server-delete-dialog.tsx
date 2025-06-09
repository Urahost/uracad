"use client";

import { Button } from "@/components/ui/button";
import { dialogManager } from "@/features/dialog-manager/dialog-manager-store";
import { authClient } from "@/lib/auth-client";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const ServerDeleteDialog = ({
  server,
}: {
  server: { id: string; slug: string };
}) => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      return unwrapSafePromise(
        authClient.organization.delete({
          organizationId: server.id,
        }),
      );
    },
    onError: (error) => {
      toast.error("Error deleting server", {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success("Server deleted", {
        description: "Your server has been deleted",
      });
      router.push("/servers");
    },
  });

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={() => {
        dialogManager.add({
          style: "centered",
          icon: X,
          title: "Delete Server",
          description: "Are you sure you want to delete your server?",
          confirmText: server.slug,
          action: {
            label: "Delete",
            onClick: async () => {
              await mutation.mutateAsync();
            },
          },
        });
      }}
    >
      <Trash2 className="mr-2" size={16} />
      Delete Server
    </Button>
  );
};
