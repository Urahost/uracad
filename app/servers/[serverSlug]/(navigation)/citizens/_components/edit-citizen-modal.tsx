"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CitizenForm } from "./citizen-form";
import type { Citizen } from "@prisma/client";

type EditCitizenModalProps = {
  citizen: Citizen;
};

export function EditCitizenModal({ citizen }: EditCitizenModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Citizen</DialogTitle>
          <DialogDescription>
            Make changes to the citizen information here.
          </DialogDescription>
        </DialogHeader>
        <CitizenForm 
          citizen={citizen} 
          serverSlug={citizen.organizationId}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
} 