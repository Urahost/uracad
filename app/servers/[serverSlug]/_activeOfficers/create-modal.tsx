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
import { createTemporaryUnit } from "./actions";
import { officerSchema, type OfficerFormData } from "./schema";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { MemberSelector } from "./member-selector";
import { useTranslations } from 'next-intl';
import { logger } from "@/lib/logger";
import { getCurrentUserInfo } from "../(navigation)/citizens/[citizenId]/fines/current-user.action";
import { getDepartments, type Department } from "../(navigation)/citizens/[citizenId]/fines/departments.action";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
};

export function CreateOfficerModal({
  open,
  onOpenChange,
  organizationId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess: () => void;
}) {
  const t = useTranslations('ActiveOfficers');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMemberSelectorOpen, setIsMemberSelectorOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState<boolean>(true);
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    name: string;
    departmentId: string | null;
  }>({
    name: "",
    departmentId: null,
  });
  
  const form = useZodForm({
    schema: officerSchema,
    defaultValues: {
      officerNumber: "",
      officerName: "",
      department: "",
      status: "On-Duty",
      callsign: "",
      radioChannel: "",
      incident: "",
      notes: "",
      isTemporary: true,
    },
  });

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      setIsDepartmentsLoading(true);
      try {
        const depts = await getDepartments();
        setDepartments(depts);

        // Apply the user's default department if available
        // and if the user hasn't already selected a department
        if (currentUserInfo.departmentId && !form.getValues("department")) {
          // Check if the user's department exists in the list
          const userDeptExists = depts.some(
            (dept) => dept.id === currentUserInfo.departmentId,
          );
          if (userDeptExists) {
            form.setValue("department", currentUserInfo.departmentId);
          }
        }
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
  }, [currentUserInfo.departmentId, form, open]);

  // Load current user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await getCurrentUserInfo();

        // Pre-fill the officer name if empty and no members selected
        if (userInfo.name && !form.getValues("officerName") && selectedMembers.length === 0) {
          form.setValue("officerName", userInfo.name);
        }

        setCurrentUserInfo(userInfo);
      } catch (error) {
        logger.error("Failed to load user info:", error);
      }
    };

    if (open) {
      void loadUserInfo();
    }
  }, [form, open, selectedMembers]);

  // Update officer name when members change
  useEffect(() => {
    if (selectedMembers.length > 0) {
      const names = selectedMembers.map(member => member.name);
      form.setValue("officerName", names.join(", "));
    }
  }, [selectedMembers, form]);

  const onSubmit = async (data: OfficerFormData) => {
    setIsSubmitting(true);
    try {
      await createTemporaryUnit({
        organizationId,
        data,
      });
      toast.success(t('createModal.createSuccess'));
      
      form.reset();
      setSelectedMembers([]);
      onOpenChange(false);
      
      // Force refresh
      if (typeof window !== 'undefined') {
        window.location.reload();
      } else {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('createModal.createError');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMember = (member: Member) => {
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setIsMemberSelectorOpen(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  // Find department name by ID
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : departmentId;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle>{t('createModal.title')}</DialogTitle>
            <DialogDescription>
              {t('createModal.description')}
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
                
                {selectedMembers.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMembers.map(member => (
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
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border rounded-md flex justify-center items-center text-muted-foreground">
                    {t('createModal.noMemberSelected')}
                  </div>
                )}
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
                          value={field.value ?? ""} 
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
                          value={field.value ?? ""} 
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
                        value={field.value ?? ""} 
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
                        value={field.value ?? ""}
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
                {t('createModal.createUnit')}
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