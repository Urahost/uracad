"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
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
import {
  EllipsisVertical,
  PlusIcon,
  Pencil,
  Trash2,
  Search,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { WarrantModal } from "./warrant-modal";
import { deleteWarrantAction, executeWarrantAction } from "./warrant.action";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/features/form/submit-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CheckPermission from "../../../permissions/check-permissions";
export type Warrant = {
  id: string;
  warrantNumber: string;
  type: "ARREST" | "SEARCH" | "OTHER";
  title: string;
  description: string;
  reason: string;
  status: "ACTIVE" | "EXECUTED" | "EXPIRED" | "CANCELLED";
  issuedDate: Date;
  expirationDate?: Date | null;
  issuedByName: string;
  issuedByDept: string;
  executedDate?: Date | null;
  executedByName?: string | null;
  executedByDept?: string | null;
  executedDetails?: string | null;
  notes?: string | null;
  address?: string | null;
  judicialCaseId?: string | null;
};

type JudicialCaseOption = {
  id: string;
  caseNumber: string;
  title: string;
};

export default function WarrantsSection({
  warrants,
  citizenId,
  judicialCases = [],
}: {
  warrants: Warrant[];
  citizenId: string;
  judicialCases: JudicialCaseOption[];
}) {
  const t = useTranslations("Warrants");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  
  // État pour le modal de création/édition de mandat
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWarrant, setEditingWarrant] = useState<Warrant | null>(null);
  
  // État pour le modal d'exécution de mandat
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [executingWarrantId, setExecutingWarrantId] = useState<string | null>(null);
  const [executionDetails, setExecutionDetails] = useState("");
  const [executedByName, setExecutedByName] = useState("");
  const [executedByDept, setExecutedByDept] = useState("");
  const [isSubmittingExecution, setIsSubmittingExecution] = useState(false);
  
  // État pour la confirmation de suppression
  const [warrantToDelete, setWarrantToDelete] = useState<Warrant | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Ouvrir le modal d'édition
  const handleEdit = (warrant: Warrant) => {
    setEditingWarrant(warrant);
  };

  // Gérer la suppression
  const handleDelete = async (warrant: Warrant) => {
    setActionInProgress(warrant.id);
    try {
      await deleteWarrantAction({ id: warrant.id });
      toast.success(t("warrantDeleted"));
      router.refresh();
    } catch (error) {
      logger.error("Error deleting warrant:", error);
      toast.error(t("deleteError"));
    } finally {
      setActionInProgress(null);
      setWarrantToDelete(null);
    }
  };

  // Ouvrir le modal d'exécution
  const handleOpenExecuteModal = (id: string) => {
    setExecutingWarrantId(id);
    setIsExecuteModalOpen(true);
  };

  // Exécuter un mandat
  const handleExecuteWarrant = async () => {
    if (!executingWarrantId) return;

    setIsSubmittingExecution(true);
    try {
      await executeWarrantAction({
        id: executingWarrantId,
        executedDetails: executionDetails,
        executedByName: executedByName,
        executedByDept: executedByDept,
      });

      toast.success(t("warrantExecuted"));
      setIsExecuteModalOpen(false);
      router.refresh();
    } catch (error) {
      logger.error("Error executing warrant:", error);
      toast.error(t("executeError"));
    } finally {
      setIsSubmittingExecution(false);
    }
  };

  // Rendu des badges de statut
  const renderStatusBadge = (status: Warrant['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">{t("status.active")}</Badge>;
      case 'EXECUTED':
        return <Badge variant="secondary">{t("status.executed")}</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline">{t("status.expired")}</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">{t("status.cancelled")}</Badge>;
      default:
        return null;
    }
  };

  // Rendu des badges de type
  const renderTypeBadge = (type: Warrant['type']) => {
    switch (type) {
      case 'ARREST':
        return <Badge className="bg-red-100 text-red-800 border-red-200">{t("types.arrest")}</Badge>;
      case 'SEARCH':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{t("types.search")}</Badge>;
      case 'OTHER':
        return <Badge variant="outline">{t("types.other")}</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          {t("warrants")}
        </CardTitle>
        <CheckPermission permissions={["CREATE_WARRANT_DRAFT"]}>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t("addWarrant")}
        </Button>
        </CheckPermission>
      </CardHeader>
      <CardContent className="h-full">
        {warrants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground">
              {t("noWarrants")}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("warrantNumber")}</TableHead>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("typeLabel")}</TableHead>
                <TableHead>{t("statusLabel")}</TableHead>
                <TableHead>{t("issuedDate")}</TableHead>
                <TableHead>{t("expirationDate")}</TableHead>
                <TableHead className="text-right">
                  {tCommon("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warrants.map((warrant) => {
                const isLoading = actionInProgress === warrant.id;
                
                return (
                  <TableRow 
                    key={warrant.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell>{warrant.warrantNumber}</TableCell>
                    <TableCell className="font-medium">{warrant.title}</TableCell>
                    <TableCell>{renderTypeBadge(warrant.type)}</TableCell>
                    <TableCell>{renderStatusBadge(warrant.status)}</TableCell>
                    <TableCell>{formatDate(warrant.issuedDate)}</TableCell>
                    <TableCell>
                      {warrant.expirationDate 
                        ? formatDate(warrant.expirationDate) 
                        : t("noExpirationDate")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8"
                              disabled={isLoading}
                            >
                              <EllipsisVertical className="h-4 w-4" />
                              <span className="sr-only">{t("actions")}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(warrant)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("edit")}
                            </DropdownMenuItem>
                            {warrant.status === "ACTIVE" && (
                              <DropdownMenuItem 
                                onClick={() => handleOpenExecuteModal(warrant.id)}
                              >
                                <Search className="h-4 w-4 mr-2" />
                                {t("executeWarrant")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setWarrantToDelete(warrant)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Modal pour créer un mandat */}
      <WarrantModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        citizenId={citizenId}
        judicialCases={judicialCases}
      />

      {/* Modal pour éditer un mandat */}
      {editingWarrant && (
        <WarrantModal
          open={!!editingWarrant}
          onOpenChange={(open) => !open && setEditingWarrant(null)}
          citizenId={citizenId}
          initialData={{
            id: editingWarrant.id,
            type: editingWarrant.type,
            title: editingWarrant.title,
            description: editingWarrant.description,
            reason: editingWarrant.reason,
            issuedDate: editingWarrant.issuedDate.toISOString(),
            expirationDate: editingWarrant.expirationDate 
              ? editingWarrant.expirationDate.toISOString() 
              : undefined,
            issuedByName: editingWarrant.issuedByName,
            issuedByDept: editingWarrant.issuedByDept,
            status: editingWarrant.status,
            notes: editingWarrant.notes ?? undefined,
            address: editingWarrant.address ?? undefined,
            judicialCaseId: editingWarrant.judicialCaseId ?? undefined,
          }}
          judicialCases={judicialCases}
        />
      )}

      {/* Boîte de dialogue de confirmation pour la suppression */}
      <AlertDialog open={!!warrantToDelete} onOpenChange={(open) => !open && setWarrantToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteWarrant")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteWarrantDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => warrantToDelete && handleDelete(warrantToDelete)}
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

      {/* Modal pour exécuter un mandat */}
      <Dialog open={isExecuteModalOpen} onOpenChange={setIsExecuteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("executeWarrantTitle")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="executionDetails">{t("executionDetails")}</Label>
              <Textarea
                id="executionDetails"
                value={executionDetails}
                onChange={(e) => setExecutionDetails(e.target.value)}
                placeholder={t("executionDetailsPlaceholder")}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="executedByName">{t("executedByName")}</Label>
              <Input
                id="executedByName"
                value={executedByName}
                onChange={(e) => setExecutedByName(e.target.value)}
                placeholder={t("executedByNamePlaceholder")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="executedByDept">{t("executedByDept")}</Label>
              <Input
                id="executedByDept"
                value={executedByDept}
                onChange={(e) => setExecutedByDept(e.target.value)}
                placeholder={t("executedByDeptPlaceholder")}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExecuteModalOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <LoadingButton onClick={handleExecuteWarrant} loading={isSubmittingExecution}>
              {t("executeWarrant")}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 