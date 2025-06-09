"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {  CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileLock2,
  FileLock,
  Archive,
  FolderClosed,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JudicialCaseModal } from "./judicial-case-modal";
import { deleteJudicialCaseAction, toggleJudicialCaseLockAction, closeJudicialCaseAction } from "./judicial-case.action";
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

export type JudicialCase = {
  id: string;
  caseNumber: string;
  title: string;
  category: string;
  status: "PENDING" | "ACTIVE" | "CLOSED" | "DISMISSED";
  description: string;
  charges?: string | null;
  verdict?: string | null;
  sentenceDetails?: string | null;
  judgeName?: string | null;
  filingDate: Date;
  hearingDate?: Date | null;
  closedDate?: Date | null;
  isSealed: boolean;
  isSensitive: boolean;
  createdByName: string;
  createdByDept: string;
};

export default function JudicialCasesSection({
  judicialCases,
  citizenId,
}: {
  judicialCases: JudicialCase[];
  citizenId: string;
}) {
  const t = useTranslations("Judicial");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  
  // État pour le modal de création/édition de dossier
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<JudicialCase | null>(null);
  
  // État pour le modal de fermeture de procédure
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingCaseId, setClosingCaseId] = useState<string | null>(null);
  const [closingVerdict, setClosingVerdict] = useState("");
  const [closingSentence, setClosingSentence] = useState("");
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);

  // État pour la confirmation de suppression
  const [caseToDelete, setCaseToDelete] = useState<JudicialCase | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filtrer les dossiers sensibles si l'utilisateur n'a pas la permission
  const filteredCases = judicialCases;

  // Ouvrir le modal d'édition
  const handleEdit = (judicialCase: JudicialCase) => {
    setEditingCase(judicialCase);
  };

  // Gérer la suppression
  const handleDelete = async (caseItem: JudicialCase) => {
    setActionInProgress(caseItem.id);
    try {
      await deleteJudicialCaseAction({ id: caseItem.id });
      toast.success(t("caseDeleted"));
      router.refresh();
    } catch (error) {
      logger.error("Error deleting judicial case:", error);
      toast.error(t("deleteError"));
    } finally {
      setActionInProgress(null);
      setCaseToDelete(null);
    }
  };

  // Gérer le verrouillage/déverrouillage
  const handleToggleLock = async (id: string, currentStatus: boolean) => {
    setActionInProgress(id);
    try {
      await toggleJudicialCaseLockAction({ 
        id, 
        isSealed: !currentStatus 
      });
      
      toast.success(currentStatus ? t("caseUnlocked") : t("caseLocked"));
      router.refresh();
    } catch (error) {
      logger.error("Error toggling case lock:", error);
      toast.error(t("lockToggleError"));
    } finally {
      setActionInProgress(null);
    }
  };

  // Ouvrir le modal de fermeture
  const handleOpenCloseModal = (id: string) => {
    setClosingCaseId(id);
    setIsCloseModalOpen(true);
  };

  // Fermer un dossier
  const handleCloseCase = async () => {
    if (!closingCaseId) return;

    setIsSubmittingClose(true);
    try {
      await closeJudicialCaseAction({
        id: closingCaseId,
        verdict: closingVerdict,
        sentenceDetails: closingSentence,
      });

      toast.success(t("caseClosed"));
      setIsCloseModalOpen(false);
      router.refresh();
    } catch (error) {
      logger.error("Error closing judicial case:", error);
      toast.error(t("closeError"));
    } finally {
      setIsSubmittingClose(false);
    }
  };

  // Rendu des badges de statut
  const renderStatusBadge = (status: JudicialCase['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">{t("status.pending")}</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">{t("status.active")}</Badge>;
      case 'CLOSED':
        return <Badge variant="outline" className="text-green-500 border-green-500">{t("status.closed")}</Badge>;
      case 'DISMISSED':
        return <Badge variant="outline" className="text-red-500 border-red-500">{t("status.dismissed")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <FolderClosed className="h-5 w-5" />
          {t("judicialCases")}
        </CardTitle>
        <Button variant="default" onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t("addCase")}
        </Button>
      </CardHeader>
      <CardContent className="h-full">
        {filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground">
              {t("noCases")}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("caseNumber")}</TableHead>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("statusLabel")}</TableHead>
                <TableHead>{t("filingDate")}</TableHead>
                <TableHead>{t("category")}</TableHead>
                <TableHead>{t("access")}</TableHead>
                <TableHead className="text-right">
                  {tCommon("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((judicialCase) => {
                const isLoading = actionInProgress === judicialCase.id;
                
                return (
                  <TableRow 
                    key={judicialCase.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell>{judicialCase.caseNumber}</TableCell>
                    <TableCell className="font-medium">{judicialCase.title}</TableCell>
                    <TableCell>{renderStatusBadge(judicialCase.status)}</TableCell>
                    <TableCell>{formatDate(judicialCase.filingDate)}</TableCell>
                    <TableCell>{t(`categories.${judicialCase.category.toLowerCase()}`, { fallback: judicialCase.category })}</TableCell>
                    <TableCell>
                      {judicialCase.isSealed && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          <FileLock2 className="h-3 w-3 mr-1" />
                          {t("sealed")}
                        </Badge>
                      )}
                      {judicialCase.isSensitive && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 ml-1">
                          {t("sensitive")}
                        </Badge>
                      )}
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
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(judicialCase)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                {t("edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={async () => handleToggleLock(judicialCase.id, judicialCase.isSealed)}
                                disabled={isLoading}
                              >
                                {judicialCase.isSealed ? (
                                  <>
                                    <FileLock className="h-4 w-4 mr-2" />
                                    {t("unlock")}
                                  </>
                                ) : (
                                  <>
                                    <FileLock2 className="h-4 w-4 mr-2" />
                                    {t("lock")}
                                  </>
                                )}
                              </DropdownMenuItem>
                              {judicialCase.status !== "CLOSED" && (
                                <DropdownMenuItem 
                                  onClick={() => handleOpenCloseModal(judicialCase.id)}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  {t("closeCase")}
                                </DropdownMenuItem>
                              )}
                            </>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setCaseToDelete(judicialCase)}
                              disabled={isLoading}
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

      {/* Modal pour créer un dossier */}
      <JudicialCaseModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        citizenId={citizenId}
      />

      {/* Modal pour éditer un dossier */}
      {editingCase && (
        <JudicialCaseModal
          open={!!editingCase}
          onOpenChange={(open) => !open && setEditingCase(null)}
          citizenId={citizenId}
          initialData={{
            id: editingCase.id,
            title: editingCase.title,
            description: editingCase.description,
            category: editingCase.category,
            status: editingCase.status,
            filingDate: editingCase.filingDate.toISOString(),
            hearingDate: editingCase.hearingDate 
              ? editingCase.hearingDate.toISOString() 
              : undefined,
            charges: editingCase.charges ?? undefined,
            verdict: editingCase.verdict ?? undefined,
            sentenceDetails: editingCase.sentenceDetails ?? undefined,
            judgeName: editingCase.judgeName ?? undefined,
            isSealed: editingCase.isSealed,
            isSensitive: editingCase.isSensitive,
            createdByName: editingCase.createdByName,
            createdByDept: editingCase.createdByDept,
          }}
        />
      )}

      {/* Boîte de dialogue de confirmation pour la suppression */}
      <AlertDialog open={!!caseToDelete} onOpenChange={(open) => !open && setCaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => caseToDelete && handleDelete(caseToDelete)}
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

      {/* Modal pour fermer un dossier */}
      <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("closeCaseTitle")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="verdict">{t("verdict")}</Label>
              <Input
                id="verdict"
                value={closingVerdict}
                onChange={(e) => setClosingVerdict(e.target.value)}
                placeholder={t("verdictPlaceholder")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sentence">{t("sentenceDetails")}</Label>
              <Textarea
                id="sentence"
                value={closingSentence}
                onChange={(e) => setClosingSentence(e.target.value)}
                placeholder={t("sentenceDetailsPlaceholder")}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseModalOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <LoadingButton onClick={handleCloseCase} loading={isSubmittingClose}>
              {t("closeCase")}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 