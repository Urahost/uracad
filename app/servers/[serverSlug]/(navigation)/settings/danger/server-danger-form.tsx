"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { dialogManager } from "@/features/dialog-manager/dialog-manager-store";
import { LoadingButton } from "@/features/form/submit-button";
import { authClient } from "@/lib/auth-client";
import { formatId } from "@/lib/format/id";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ServerDangerFormSchemaType } from "../server.schema";
import { ServerDangerFormSchema } from "../server.schema";

type ProductFormProps = {
  defaultValues: ServerDangerFormSchemaType;
};

export const ServerDangerForm = ({ defaultValues }: ProductFormProps) => {
  const form = useZodForm({
    schema: ServerDangerFormSchema,
    defaultValues,
  });
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: ServerDangerFormSchemaType) => {
      return unwrapSafePromise(
        authClient.organization.update({
          data: {
            slug: values.slug,
          },
        }),
      );
    },
    onSuccess: (data) => {
      const newUrl = window.location.href.replace(
        `/servers/${defaultValues.slug}/`,
        `/servers/${data.slug}/`,
      );
      router.push(newUrl);
      form.reset(data as ServerDangerFormSchemaType);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Form
      form={form}
      onSubmit={(v) => {
        dialogManager.add({
          title: "Are you sure ?",
          description:
            "You are about to change the unique identifier of your server. All the previous URLs will be changed.",
          action: {
            label: "Yes, change the slug",
            onClick: () => {
              mutation.mutate(v);
            },
          },
        });
      }}
      className="flex w-full flex-col gap-6 lg:gap-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Slug</CardTitle>
          <CardDescription>
            Slug is the unique identifier of your server. It's used in all
            the URLs, if you change it, all your URLs will be broken.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    onChange={(e) => {
                      const slug = formatId(e.target.value);
                      field.onChange(slug);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="border-tu flex justify-end">
          <LoadingButton loading={mutation.isPending} type="submit">
            Save
          </LoadingButton>
        </CardFooter>
      </Card>
    </Form>
  );
};
