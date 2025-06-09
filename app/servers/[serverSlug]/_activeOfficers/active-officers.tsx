"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, MoreHorizontal, RefreshCw } from "lucide-react";
import { useState, useTransition, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { deleteActiveOfficer, getActiveOfficers } from "./actions";
import { CreateOfficerModal } from "./create-modal";
import { UpdateOfficerModal } from "./update-modal";
import { type ActiveOfficer } from "./schema";
import { logger } from "@/lib/logger";
import { useTranslations } from 'next-intl';
import { getDepartments, type Department } from "../(navigation)/citizens/[citizenId]/fines/departments.action";
import { useRouter } from "next/navigation";

export function ActiveOfficersSection({
  officers: initialOfficers,
  organizationId,
}: {
  officers: ActiveOfficer[];
  organizationId: string;
}) {
  const [officers, setOfficers] = useState<ActiveOfficer[]>(initialOfficers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<ActiveOfficer | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const t = useTranslations('ActiveOfficers');
  const router = useRouter();

  useEffect(() => {
    // Load departments for display
    const loadDepartments = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts);
      } catch (error) {
        logger.error("Failed to load departments:", error);
      }
    };
    
    void loadDepartments();
  }, []);

  const refreshOfficers = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await getActiveOfficers({ organizationId });
      if (result && Array.isArray(result)) {
        setOfficers(result);
        return true; // Refresh successful
      }
      return false; // Refresh failed
    } catch (error) {
      logger.error("Failed to refresh officers:", error); 
      toast.error(t('notifications.refreshError'));
      return false; // Refresh failed
    } finally {
      setIsRefreshing(false);
    }
  }, [organizationId, t]);

  // Auto-refresh on mount
  useEffect(() => {
    void refreshOfficers();
  }, [refreshOfficers]);
  
  const handleDeleteOfficer = (id: string) => {
    startTransition(async () => {
      try {
        await deleteActiveOfficer({ id, organizationId });
        toast.success(t('notifications.deleteSuccess'));
        
        // Force refresh after delete
        const refreshSuccess = await refreshOfficers();
        if (!refreshSuccess) {
          // If automatic refresh fails, tell the user
          toast.error("La liste n'a pas pu être actualisée. Veuillez rafraîchir manuellement.");
        }
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : t('notifications.deleteError');
        toast.error(message);
      }
    });
  };

  // Translate status
  const getStatusTranslation = (status: string): string => {
    if (status.toLowerCase().includes("on-duty") || status.toLowerCase() === "on duty") 
      return t('statusLabels.onDuty');
    if (status.toLowerCase().includes("meal") || status.toLowerCase().includes("break")) 
      return t('statusLabels.meal');
    if (status.toLowerCase().includes("respond")) 
      return t('statusLabels.responding');
    if (status.toLowerCase().includes("patrol")) 
      return t('statusLabels.patrol');
    if (status.toLowerCase().includes("emergency")) 
      return t('statusLabels.emergency');
    
    return status; // Fallback to original if no match
  };

  // Function to render the status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    const translatedStatus = getStatusTranslation(status);
    
    if (status.toLowerCase().includes("break") || status.toLowerCase().includes("meal")) {
      return <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-200">{translatedStatus}</Badge>;
    } 
    if (status.toLowerCase().includes("duty") || status.toLowerCase().includes("patrol")) {
      return <Badge variant="outline" className="bg-green-500/15 text-green-600 border-green-200">{translatedStatus}</Badge>;
    }
    if (status.toLowerCase().includes("responding") || status.toLowerCase().includes("emergency")) {
      return <Badge variant="outline" className="bg-red-500/15 text-red-600 border-red-200">{translatedStatus}</Badge>;
    }
    return <Badge variant="outline">{translatedStatus}</Badge>;
  };

  // Function to get department name
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : departmentId;
  };

  const handleCreateSuccess = async () => {
    await refreshOfficers();
    router.refresh();
  };

  const handleUpdateSuccess = async () => {
    await refreshOfficers();
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">{t('title')}</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => void refreshOfficers()}
              disabled={isRefreshing}
              title="Actualiser la liste"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              {t('createTemporaryUnit')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableHeaders.officer')}</TableHead>
                  <TableHead>{t('tableHeaders.badgeNumber')}</TableHead>
                  <TableHead>{t('tableHeaders.department')}</TableHead>
                  <TableHead>{t('tableHeaders.status')}</TableHead>
                  <TableHead>{t('tableHeaders.incident')}</TableHead>
                  <TableHead>{t('tableHeaders.activeCall')}</TableHead>
                  <TableHead>{t('tableHeaders.radioChannel')}</TableHead>
                  <TableHead className="w-[80px]">{t('tableHeaders.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {t('noOfficersFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  officers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell className={officer.isTemporary ? "italic" : ""}>
                        {officer.officerName}
                      </TableCell>
                      <TableCell>{officer.officerNumber}</TableCell>
                      <TableCell>{getDepartmentName(officer.department)}</TableCell>
                      <TableCell>{renderStatusBadge(officer.status)}</TableCell>
                      <TableCell>{officer.incident ?? t('placeholders.none')}</TableCell>
                      <TableCell>{officer.callsign ?? t('placeholders.none')}</TableCell>
                      <TableCell>{officer.radioChannel ?? t('placeholders.noChannel')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOfficer(officer)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t('actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteOfficer(officer.id)}
                              disabled={isPending}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('actions.remove')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateOfficerModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        organizationId={organizationId}
        onSuccess={handleCreateSuccess}
      />
      
      {selectedOfficer && (
        <UpdateOfficerModal
          open={!!selectedOfficer}
          onOpenChange={() => setSelectedOfficer(null)}
          officer={selectedOfficer}
          organizationId={organizationId}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
} 