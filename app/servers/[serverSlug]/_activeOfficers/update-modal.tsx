"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/features/form/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { updateActiveOfficer } from "./actions";
import { officerSchema, type OfficerFormData, type ActiveOfficer } from "./schema";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { logger } from "@/lib/logger";
import { getDepartments, type Department } from "../(navigation)/citizens/[citizenId]/fines/departments.action";
import { MemberSelector } from "./member-selector";
import { UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
};

export function UpdateOfficerModal({
  open,
  onOpenChange,
  officer,
  organizationId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officer: ActiveOfficer;
  organizationId: string;
  onSuccess: () => void;
}) {
  const t = useTranslations('ActiveOfficers');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState<boolean>(true);
  const [isMemberSelectorOpen, setIsMemberSelectorOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [existingOfficerNames, setExistingOfficerNames] = useState<string[]>([]);

  const form = useZodForm({
    schema: officerSchema,
    defaultValues: {
      officerNumber: officer.officerNumber,
      officerName: officer.officerName,
      department: officer.department,
      status: officer.status,
      callsign: officer.callsign ?? "",
      radioChannel: officer.radioChannel ?? "",
      incident: officer.incident ?? "",
      notes: officer.notes ?? "",
      isTemporary: officer.isTemporary,
    },
  });

  // Initialize existing officer names
  useEffect(() => {
    if (officer.officerName) {
      const names = officer.officerName.split(',').map(name => name.trim());
      setExistingOfficerNames(names);
    }
  }, [officer.officerName]);

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      setIsDepartmentsLoading(true);
      try {
        const depts = await getDepartments();
        setDepartments(depts);
      } catch (error) {
        logger.error("Failed to load departments:", error);
        setDepartments([]);
      } finally {
        setIsDepartmentsLoading(false);
      }
    };

    if (open) {
      void loadDepartments();
    }
  }, [open]);

  // Update officer name when selected members change
  useEffect(() => {
    if (selectedMembers.length > 0 || existingOfficerNames.length > 0) {
      // Combine existing names and new members' names
      const newMemberNames = selectedMembers.map(member => member.name);
      const allNames = [...existingOfficerNames, ...newMemberNames];
      
      // Update the form field
      form.setValue("officerName", allNames.join(", "));
    }
  }, [selectedMembers, existingOfficerNames, form]);

  const onSubmit = async (data: OfficerFormData) => {
    setIsSubmitting(true);
    try {
      await updateActiveOfficer({
        id: officer.id,
        organizationId,
        data,
      });
      
      toast.success(t('updateModal.updateSuccess'));
      onOpenChange(false);
      
      // Force refresh
      if (typeof window !== 'undefined') {
        window.location.reload();
      } else {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('updateModal.updateError');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find department name by ID
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : departmentId;
  };

  const handleSelectMember = (member: Member) => {
    // Add only if not already in the list
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setIsMemberSelectorOpen(false);
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = [...selectedMembers];
    newMembers.splice(index, 1);
    setSelectedMembers(newMembers);
  };

  const handleRemoveExistingName = (index: number) => {
    const newNames = [...existingOfficerNames];
    newNames.splice(index, 1);
    setExistingOfficerNames(newNames);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle>{t('updateModal.title')}</DialogTitle>
            <DialogDescription>
              {t('updateModal.description')} {officer.officerName}
            </DialogDescription>
          </DialogHeader>
          <Form form={form} onSubmit={onSubmit}>
            <div className="grid gap-4 py-4">
              {/* Member selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>{t('tableHeaders.officer')}</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    onClick={() => setIsMemberSelectorOpen(true)}
                  >
                    <UserPlus className="mr-1 h-3 w-3" /> 
                    {t('createModal.selectMember')}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {/* Existing officer names */}
                  {existingOfficerNames.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Membres existants:</p>
                      <div className="space-y-2">
                        {existingOfficerNames.map((name, index) => (
                          <div key={`existing-${index}`} className="flex items-center gap-2 p-2 border rounded-md">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{name}</p>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="ml-auto p-0 h-8 w-8"
                              onClick={() => handleRemoveExistingName(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Newly added members */}
                  {selectedMembers.length > 0 && (
                    <div>
                      {existingOfficerNames.length > 0 && (
                        <p className="text-xs text-muted-foreground mb-2">Nouveaux membres:</p>
                      )}
                      <div className="space-y-2">
                        {selectedMembers.map((member, index) => (
                          <div key={member.id} className="flex items-center gap-2 p-2 border rounded-md">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.image ?? ""} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="ml-auto p-0 h-8 w-8"
                              onClick={() => handleRemoveMember(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {existingOfficerNames.length === 0 && selectedMembers.length === 0 && (
                    <div className="p-4 border rounded-md flex justify-center items-center text-muted-foreground">
                      {t('createModal.noMemberSelected')}
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="officerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createModal.officerName')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('createModal.officerNamePlaceholder')}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="officerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createModal.badgeNumber')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('createModal.badgeNumberPlaceholder')}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createModal.department')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isDepartmentsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('createModal.selectDepartment')}>
                            {field.value ? getDepartmentName(field.value) : t('createModal.selectDepartment')}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createModal.status')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('createModal.statusPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="On-Duty">{t('statusLabels.onDuty')}</SelectItem>
                        <SelectItem value="Meal break">{t('statusLabels.meal')}</SelectItem>
                        <SelectItem value="Responding">{t('statusLabels.responding')}</SelectItem>
                        <SelectItem value="On Patrol">{t('statusLabels.patrol')}</SelectItem>
                        <SelectItem value="Emergency">{t('statusLabels.emergency')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="radioChannel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('createModal.radioChannel')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('createModal.radioChannelPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="callsign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('createModal.activeCall')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('createModal.activeCallPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="incident"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createModal.incident')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('createModal.incidentPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createModal.notes')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('createModal.notesPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('createModal.cancel')}
              </Button>
              <LoadingButton type="submit" loading={isSubmitting}>
                {t('updateModal.update')}
              </LoadingButton>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Member selector */}
      <MemberSelector
        organizationId={organizationId}
        open={isMemberSelectorOpen}
        onOpenChange={setIsMemberSelectorOpen}
        onSelectMember={handleSelectMember}
      />
    </>
  );
} 