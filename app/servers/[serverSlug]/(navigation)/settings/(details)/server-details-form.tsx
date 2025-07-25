"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormAutoSave } from "@/features/form/form-auto-save";
import { FormAutoSaveStickyBar } from "@/features/form/form-auto-save-sticky-bar";
import { ImageFormItem } from "@/features/images/image-form-item";
import { authClient } from "@/lib/auth-client";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ServerDetailsFormSchema, type ServerDetailsFormSchemaType } from "../server.schema";
import { ThemeSelector } from "@/components/theme-selector";
import { SyncConfigForm } from "@/features/sync/sync-config-form";

type ServerDetailsFormProps = {
  defaultValues: ServerDetailsFormSchemaType;
  organizationId: string;
  currentTheme?: string;
  organization: {
    apiUrl: string | null;
    syncInterval: number | null;
  };
};

export const ServerDetailsForm = ({
  defaultValues,
  organizationId,
  currentTheme,
  organization,
}: ServerDetailsFormProps) => {
  const form = useZodForm({
    schema: ServerDetailsFormSchema,
    defaultValues,
  });
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: ServerDetailsFormSchemaType) => {
      return unwrapSafePromise(
        authClient.organization.update({
          data: {
            logo: values.logo ?? undefined,
            name: values.name,
          },
        }),
      );
    },
    onSuccess: (data) => {
      router.refresh();
      form.reset(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: ServerDetailsFormSchemaType) => {
    return mutation.mutateAsync(values);
  };

  return (
    <FormAutoSave
      form={form}
      onSubmit={onSubmit}
      autoSaveMs={1000}
      className="flex w-full flex-col gap-6 lg:gap-8"
    >
      <FormAutoSaveStickyBar />
      <Card>
        <CardHeader>
          <CardTitle>Image</CardTitle>
          <CardDescription>
            Add a custom image to your server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageFormItem
                    className="size-32 rounded-full"
                    onChange={(url) => field.onChange(url)}
                    imageUrl={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <CardDescription>
            Use your server's name or your name if you don't have a
            server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose a theme for your server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector organizationId={organizationId} currentTheme={currentTheme} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Server synchronization</CardTitle>
          <CardDescription>
            Configure the API endpoint and synchronization settings for your server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SyncConfigForm 
            organizationId={organizationId}
            defaultValues={{
              apiUrl: organization.apiUrl ?? '',
              syncInterval: organization.syncInterval ?? 300000,
            }}
          />
        </CardContent>
      </Card>
      <div className="flex justify-end p-6">
        <Button type="submit" className="w-fit">
          Save
        </Button>
      </div>
    </FormAutoSave>
  );
};
