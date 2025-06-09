"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { createCitizenAction, updateCitizenAction } from "../_actions/citizens.action";
import { CitizenSchema } from "../citizens.schema";
import type { CitizenSchemaType } from "../citizens.schema";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Citizen } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/features/form/submit-button";
import { ImageFormItem } from "@/features/images/image-form-item";
import { DatePicker } from "@/components/ui/date-picker";
import { generateSSN } from "../_utils/generate-ssn";
import { Wand2 } from "lucide-react";

type CitizenFormProps = {
  citizen?: Citizen | null;
  serverSlug: string;
  onSuccess?: () => void;
};

export function CitizenForm({ citizen, serverSlug, onSuccess }: CitizenFormProps) {
  const router = useRouter();
  const isEditing = !!citizen;

  const defaultValues: Partial<CitizenSchemaType> = {
    id: citizen?.id ?? undefined,
    image: citizen?.image ?? null,
    name: citizen?.name ?? "",
    surname: citizen?.surname ?? "",
    dateOfBirth: citizen?.dateOfBirth ? new Date(citizen.dateOfBirth) : undefined,
    socialSecurityNumber: citizen?.socialSecurityNumber ?? "",
    gender: citizen?.gender ?? "",
    ethnicity: citizen?.ethnicity ?? "",
    hairColor: citizen?.hairColor ?? "",
    eyeColor: citizen?.eyeColor ?? "",
    weight: citizen?.weight ?? undefined,
    height: citizen?.height ?? undefined,
    address: citizen?.address ?? "",
    postal: citizen?.postal ?? "",
    phone: citizen?.phone ?? "",
    occupation: citizen?.occupation ?? "",
    additionalInfo: citizen?.additionalInfo ?? "",
    driversLicense: citizen?.driversLicense ?? "",
    driversLicenseCategories: citizen?.driversLicenseCategories ?? "",
    pilotLicense: citizen?.pilotLicense ?? "",
    pilotLicenseCategories: citizen?.pilotLicenseCategories ?? "",
    waterLicense: citizen?.waterLicense ?? "",
    waterLicenseCategories: citizen?.waterLicenseCategories ?? "",
    firearmsLicense: citizen?.firearmsLicense ?? "",
    firearmsLicenseCategories: citizen?.firearmsLicenseCategories ?? "",
  };

  const form = useZodForm({
    schema: CitizenSchema,
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CitizenSchemaType) => {
      return resolveActionResult(createCitizenAction(data));
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Citizen created successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/servers/${serverSlug}/citizens`);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CitizenSchemaType) => {
      if (!data.id) {
        throw new Error("Citizen ID is required for update");
      }
      return resolveActionResult(updateCitizenAction({...data, id: data.id}));
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Citizen updated successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/servers/${serverSlug}/citizens`);
      }
    },
  });

  const onSubmit = (data: CitizenSchemaType) => {
    if (isEditing) {
      if (!data.id && citizen.id) {
        data.id = citizen.id;
      }
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-6">
        {/* Infos personnelles */}
        <div className="space-y-4">
          <div className="mb-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <ImageFormItem
                      className="size-32 mx-auto rounded-full"
                      onChange={(url) => field.onChange(url)}
                      imageUrl={null}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surname</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <div className="flex w-full">
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onDateChange={field.onChange}
                        placeholder="Select date of birth"
                        className="w-full"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="socialSecurityNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Security Number</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="XXX-XX-XXXX" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => form.setValue("socialSecurityNumber", generateSSN())}
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric" 
                      placeholder="70"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : null;
                        field.onChange(val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="175"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : null;
                        field.onChange(val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Attributs et contact */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ethnicity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ethnicity</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ethnicity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Caucasian">Caucasian</SelectItem>
                      <SelectItem value="African American">African American</SelectItem>
                      <SelectItem value="Hispanic">Hispanic</SelectItem>
                      <SelectItem value="Asian">Asian</SelectItem>
                      <SelectItem value="Native American">Native American</SelectItem>
                      <SelectItem value="Pacific Islander">Pacific Islander</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hairColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hair Color</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hair color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Blonde">Blonde</SelectItem>
                      <SelectItem value="Red">Red</SelectItem>
                      <SelectItem value="Gray">Gray</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="eyeColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eye Color</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select eye color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Blue">Blue</SelectItem>
                      <SelectItem value="Green">Green</SelectItem>
                      <SelectItem value="Hazel">Hazel</SelectItem>
                      <SelectItem value="Amber">Amber</SelectItem>
                      <SelectItem value="Gray">Gray</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="postal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="12345" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="555-123-4567" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Software Developer" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Licences et informations additionnelles */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="driversLicense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drivers License</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Revoked">Revoked</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="driversLicenseCategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DL Categories</FormLabel>
                  <FormControl>
                    <Input placeholder="A, B, C" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pilotLicense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilot License</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Revoked">Revoked</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pilotLicenseCategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PL Categories</FormLabel>
                  <FormControl>
                    <Input placeholder="PPL, CPL" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="waterLicense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water License</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Revoked">Revoked</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="waterLicenseCategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WL Categories</FormLabel>
                  <FormControl>
                    <Input placeholder="A, B, C" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firearmsLicense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firearms License</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Revoked">Revoked</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="firearmsLicenseCategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FL Categories</FormLabel>
                  <FormControl>
                    <Input placeholder="A, B, C" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes or information about this citizen"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
            
      <div className="flex justify-end space-x-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/servers/${serverSlug}/citizens`)}
        >
          Cancel
        </Button>
        <LoadingButton type="submit" loading={isPending}>
          {isEditing ? "Update Citizen" : "Create Citizen"}
        </LoadingButton>
      </div>
    </Form>
  );
} 