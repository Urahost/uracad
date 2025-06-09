"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CitizenForm } from "./citizen-form";

type CreateCitizenModalProps = {
  serverSlug: string;
};

export function CreateCitizenModal({ serverSlug }: CreateCitizenModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Create Citizen
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen max-w-[1200px] h-fit max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Create Citizen</DialogTitle>
        </DialogHeader>
        <CitizenForm
          serverSlug={serverSlug}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
