"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schéma de validation pour les données soumises
const actionSchema = z.object({
  fineId: z.string().min(1, "ID de l'amende requis"),
  action: z.enum(["pay", "contest"]).refine(val => ["pay", "contest"].includes(val), {
    message: "Action invalide"
  })
});

export async function processFineAction(formData: FormData) {
  try {
    // Récupérer et valider les données du formulaire
    const fineId = formData.get("fineId") as string;
    const action = formData.get("action") as "pay" | "contest";
    
    // Validation avec Zod
    const result = actionSchema.safeParse({ fineId, action });
    if (!result.success) {
      return { 
        success: false, 
        message: "Données incorrectes",
        errors: result.error.flatten().fieldErrors
      };
    }
    
    // Vérifier que l'amende existe et est en statut PENDING
    const fine = await prisma.fine.findFirst({
      where: {
        id: fineId,
        status: "PENDING",
      },
      include: {
        citizen: true,
      },
    });
    
    if (!fine) {
      return {
        success: false,
        message: "Amende non trouvée ou déjà traitée"
      };
    }
    
    // Mettre à jour le statut de l'amende
    const newStatus = action === "pay" ? "PAID" : "CONTESTED";
    
    await prisma.fine.update({
      where: { id: fineId },
      data: {
        status: newStatus,
        paidAt: newStatus === "PAID" ? new Date() : undefined,
      },
    });
    
    // Rediriger vers la même page avec un message de succès
    const redirectUrl = `/servers/${fine.citizen.organizationId}/public/fines/${fineId}?success=${action}`;
    redirect(redirectUrl);
  } catch (error) {
    logger.error("Erreur lors du traitement de l'amende", error);
    return {
      success: false,
      message: "Une erreur est survenue lors du traitement de l'amende"
    };
  }
} 