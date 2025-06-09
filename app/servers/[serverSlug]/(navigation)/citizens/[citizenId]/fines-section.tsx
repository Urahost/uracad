"use client";

import React from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge,
} from "@/components/ui/badge";
import type { Citizen, Fine } from "@prisma/client";
import { TrashIcon, DollarSignIcon, ChevronDownIcon, ChevronUpIcon, Loader2, PiggyBank, Share2 } from "lucide-react";
import { useState } from "react";
import formatCurrency from "@/lib/format/currency";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import AddFineDialog from "./add-fine-dialog";
import { deleteFineAction, processFinePaymentAction } from "./fines/fines.action";
import { logger } from "@/lib/logger";
import CheckPermission from "../../permissions/check-permissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FineWithPenalCode = Fine & {
  penalCode: {
    code: string;
    description: string;
  } | null;
};

export default function FinesSection({
  fines,
  citizen,
}: {
  fines: FineWithPenalCode[];
  citizen: Citizen;
}) {
  const t = useTranslations("Fines");
  const tCommon = useTranslations("Common");
  
  // Use translation keys instead of hardcoded strings
  const dateTranslation = t("date");
  const statusTranslation = t("statusLabel");
  
  const router = useRouter();
  const params = useParams();
  const serverSlug = params.serverSlug as string;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [fineToDelete, setFineToDelete] = useState<FineWithPenalCode | null>(null);
  const [fineToPayOptions, setFineToPayOptions] = useState<{fine: FineWithPenalCode, action: 'pay' | 'contest'} | null>(null);
  const [copyInProgress, setCopyInProgress] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };
  
  const renderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">{t("status.pending")}</Badge>;
      case "PAID":
        return <Badge variant="outline" className="text-green-500 border-green-500">{t("status.paid")}</Badge>;
      case "CONTESTED":
        return <Badge variant="outline" className="text-red-500 border-red-500">{t("status.contested")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Gérer le paiement ou la contestation d'une amende
  const handlePaymentAction = async (fine: FineWithPenalCode, action: 'pay' | 'contest') => {
    setActionInProgress(fine.id);
    try {
      await processFinePaymentAction({ 
        id: fine.id, 
        status: action === 'pay' ? "PAID" : "CONTESTED" 
      });
      toast.success(action === 'pay' ? t("actions.paySuccess") : t("actions.contestSuccess"));
      router.refresh();
    } catch (error) {
      toast.error(action === 'pay' ? t("actions.payError") : t("actions.contestError"));
      logger.error(error);
    } finally {
      setActionInProgress(null);
      setFineToPayOptions(null);
    }
  };
  
  // Gérer la suppression d'une amende
  const handleDelete = async (fine: FineWithPenalCode) => {
    setActionInProgress(fine.id);
    try {
      await deleteFineAction({ id: fine.id });
      toast.success(t("actions.deleteSuccess"));
      router.refresh();
    } catch (error) {
      toast.error(t("actions.deleteError"));
      logger.error(error);
    } finally {
      setActionInProgress(null);
      setFineToDelete(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };
  
  // Fonction pour copier le lien de partage d'une amende
  const copyShareLink = async (fineId: string) => {
    setCopyInProgress(fineId);
    try {

      const shareUrl = `${window.location.origin}/servers/${serverSlug}/public/fines/${fineId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("actions.linkCopied"));
    } catch (error) {
      logger.error(error);
      toast.error("Failed to copy to clipboard");
    } finally {
      setCopyInProgress(null);
    }
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <CheckPermission permissions={["CREATE_FINE"]}>
            <AddFineDialog citizen={citizen} />
          </CheckPermission>
        </div>
      </CardHeader>
      <CardContent className="h-min">
        
        {fines.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground">
              {t("noFines")}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dateTranslation}</TableHead>
                <TableHead>{t("offense")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{statusTranslation}</TableHead>
                <TableHead className="text-right">
                  {tCommon("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fines.map((fine) => {
                const isExpanded = expandedIds.has(fine.id);
                const isLoading = actionInProgress === fine.id;
                
                return (
                  <React.Fragment key={fine.id}>
                    <TableRow 
                      className="hover:bg-muted/50"
                    >
                      <TableCell>{formatDate(fine.createdAt)}</TableCell>
                      <TableCell>
                        {fine.penalCode ? (
                          <div>
                            <div className="font-medium">{fine.penalCode.code}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {fine.reason}
                            </div>
                          </div>
                        ) : (
                          <div className="font-medium">{fine.reason}</div>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(fine.amount)}</TableCell>
                      <TableCell>{renderStatus(fine.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(fine.id);
                            }}
                            className="h-7 px-2"
                            disabled={isLoading}
                          >
                            <span className="mr-1 text-xs">{isExpanded ? t("close") : t("details")}</span>
                            {isExpanded ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                          </Button>
                          
                          <div className="flex items-center space-x-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void copyShareLink(fine.id);
                                    }}
                                    disabled={copyInProgress === fine.id || isLoading}
                                  >
                                    {copyInProgress === fine.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Share2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">{t("shareFine")}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("copyShareLink")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {fine.status === "PENDING" && (
                              <CheckPermission permissions={["EDIT_FINE"]}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                  onClick={(e) => {
                                  e.stopPropagation();
                                  setFineToPayOptions({fine, action: 'pay'});
                                }}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <DollarSignIcon className="h-4 w-4" />
                                )}
                                  <span className="sr-only">{t("payFine")}</span>
                                </Button>
                              </CheckPermission>
                            )}
                            <CheckPermission permissions={["DELETE_FINE"]}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFineToDelete(fine);
                              }}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
                                <span className="sr-only">{t("deleteFine")}</span>
                              </Button>
                            </CheckPermission>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={5} className="px-4 py-4">
                          <div className="grid grid-cols-2 gap-4 py-2">
                            <div>
                              <p className="text-xs text-muted-foreground">{t("issuedBy")}</p>
                              <p>{fine.issuedByName} ({fine.issuedByDept})</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t("location")}</p>
                              <p>{fine.location ?? t("notSpecified")}</p>
                            </div>
                            {fine.licensePoints && fine.licensePoints > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground">{t("pointsDeducted")}</p>
                                <p>{fine.licensePoints}</p>
                              </div>
                            )}
                            {fine.jailTime && fine.jailTime > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground">{t("jailTime")}</p>
                                <p>{fine.jailTime} {t("minutes")}</p>
                              </div>
                            )}
                            {fine.notes && (
                              <div className="col-span-2">
                                <p className="text-xs text-muted-foreground">{t("notes")}</p>
                                <p className="whitespace-pre-wrap">{fine.notes}</p>
                              </div>
                            )}
                            <div className="col-span-2 mt-2 pt-2 border-t flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void copyShareLink(fine.id);
                                }}
                                disabled={copyInProgress === fine.id}
                              >
                                {copyInProgress === fine.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Share2 className="h-4 w-4 mr-2" />
                                )}
                                {t("generateShareLink")}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Boîte de dialogue de confirmation pour la suppression */}
      <AlertDialog open={!!fineToDelete} onOpenChange={(open) => !open && setFineToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteFine")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteFineDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => fineToDelete && handleDelete(fineToDelete)}
              disabled={!!actionInProgress}
            >
              {actionInProgress ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Boîte de dialogue pour le paiement ou la contestation d'une amende */}
      <AlertDialog open={!!fineToPayOptions} onOpenChange={(open) => !open && setFineToPayOptions(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("payFine")}</AlertDialogTitle>
            <AlertDialogDescription>
              {fineToPayOptions?.fine ? t("payFineDescription", { amount: fineToPayOptions.fine.amount.toString() }) : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="sm:mr-2">{tCommon("cancel")}</AlertDialogCancel>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={async () => fineToPayOptions?.fine && handlePaymentAction(fineToPayOptions.fine, 'contest')}
                disabled={!!actionInProgress}
              >
                {actionInProgress && fineToPayOptions?.action === 'contest' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {t("contestFine")}
              </Button>
              <Button 
                onClick={async () => fineToPayOptions?.fine && handlePaymentAction(fineToPayOptions.fine, 'pay')}
                disabled={!!actionInProgress}
              >
                {actionInProgress && fineToPayOptions?.action === 'pay' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {t("payNow")}
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}