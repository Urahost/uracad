"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/features/form/submit-button";
import { useDebounceFn } from "@/hooks/use-debounce-fn";
import { authClient } from "@/lib/auth-client";
import { formatId } from "@/lib/format/id";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import type { NewServerSchemaType } from "./new-server.schema";
import { CreateServerSchema } from "./new-server.schema";

export const NewServerForm = () => {
  const form = useZodForm({
    schema: CreateServerSchema,
  });
  const router = useRouter();

  const checkSlugMutation = useMutation({
    mutationFn: async (slug: string) => {
      const { data, error } = await authClient.organization.checkSlug({
        slug,
      });

      if (error) {
        form.setError("slug", {
          message: "This server ID is already taken",
        });
      }

      return data;
    },
  });

  const debouncedCheckSlug = useDebounceFn((slug: string) => {
    if (slug) {
      checkSlugMutation.mutate(slug);
    }
  }, 500);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.slug) {
        debouncedCheckSlug(values.slug as string);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, debouncedCheckSlug]);

  const mutation = useMutation({
    mutationFn: async (values: NewServerSchemaType) => {
      const result = await authClient.organization.create({
        name: values.name,
        slug: values.slug,
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Server created successfully");
      router.refresh();
      router.push(`/servers/${result.data.slug}`);
    },
  });

  return (
    <Form
      form={form}
      onSubmit={async (v) => mutation.mutateAsync(v)}
      className="flex w-full flex-col gap-6 lg:gap-8"
    >
      <Card className="bg-card overflow-hidden">
        <CardContent className="mt-6 flex flex-col gap-4 lg:gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Server Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    className="input"
                    placeholder="Enter server name"
                    onChange={(e) => {
                      field.onChange(e);
                      const formattedSlug = formatId(e.target.value);
                      form.setValue("slug", formattedSlug);
                      debouncedCheckSlug(formattedSlug);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Server Slug</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    className="input"
                    placeholder="Enter server Slug"
                    onChange={(e) => {
                      const formattedSlug = formatId(e.target.value);
                      field.onChange(formattedSlug);
                      form.setValue("slug", formattedSlug);
                      debouncedCheckSlug(formattedSlug);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The server ID is used to identify the server, it
                  will be used in all the URLs.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="border-border flex justify-end border-t pt-6">
          <LoadingButton
            type="submit"
            size="lg"
            disabled={checkSlugMutation.isPending}
          >
            Create server
          </LoadingButton>
        </CardFooter>
      </Card>
    </Form>
  );
};
