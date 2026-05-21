"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createWorkspaceSchema, CreateWorkspaceType } from "../schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { tryCatch } from "@/lib/try-catch";
import { authClient } from "@/lib/auth-client";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function CreateWorkspaceDialog() {
  const form = useForm<CreateWorkspaceType>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
    mode: "onChange",
  });

  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(values: CreateWorkspaceType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        authClient.organization.create({
          name: values.name,
          slug: values.slug,
          keepCurrentActiveOrganization: false,
        })
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      toast.success(result.data?.name + " workspace created successfully");
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Workspace</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Create a new workspace.</DialogDescription>
        </DialogHeader>
        <form id="workspace-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid && fieldState.isTouched}
                    autoComplete="name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid && fieldState.isTouched}
                    autoComplete="slug"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <Field className="mt-4">
          <Button disabled={pending} type="submit" form="workspace-form">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Creating
                workspace...
              </>
            ) : (
              <>Create Workspace</>
            )}
          </Button>
        </Field>
      </DialogContent>
    </Dialog>
  );
}
