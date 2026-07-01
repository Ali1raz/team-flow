/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ReactNode, useEffect, useState } from "react";
import { createSlug } from "@/lib/utils";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { updateWorkspaceSchema, UpdateWorkspaceType } from "../schema";
import { ImageUploadDialog } from "../[workspaceId]/_components/image-dialog";
import { AttachmentChip } from "../[workspaceId]/_components/attachment-chip";

export function UpdateWorkspaceDialog({
  children,
  workspaceId,
  currentName,
  currentLogo,
}: {
  children?: ReactNode;
  workspaceId: string;
  currentName: string;
  currentLogo?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateWorkspaceType>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: currentName,
      logo: currentLogo ?? null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: currentName, logo: currentLogo ?? null });
    }
  }, [open, currentName, currentLogo, form]);

  const queryClient = useQueryClient();

  const updateWorkspaceMutation = useMutation(
    orpc.workspace.update.mutationOptions({
      onSuccess: (workspace) => {
        toast.success(`"${workspace.name}" updated successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.list.queryKey(),
        });
        setOpen(false);
        form.reset({ name: workspace.name, logo: workspace.logo ?? null });
      },
      onError: (error) => {
        toast.error("Something bad happened, please try again!", {
          description: error instanceof Error ? error.message : null,
        });
      },
    })
  );

  function onSubmit(values: UpdateWorkspaceType) {
    updateWorkspaceMutation.mutate({
      workspaceId,
      name: values.name,
      logo: values.logo ?? null,
    });
  }

  const watchedLogo = form.watch("logo");
  const watchedName = form.watch("name");
  const slugPreview = createSlug(watchedName ?? "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Workspace</DialogTitle>
          <DialogDescription>
            Update your workspace information.
          </DialogDescription>
        </DialogHeader>
        <form id="update-workspace-form" onSubmit={form.handleSubmit(onSubmit)}>
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
            <Field>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <Input id="slug" value={slugPreview} readOnly />
            </Field>
            <Field>
              <FieldLabel>Logo</FieldLabel>
              <div className="flex items-center gap-3">
                {watchedLogo ? (
                  <AttachmentChip
                    url={watchedLogo}
                    onDelete={() => form.setValue("logo", null)}
                    onChangeComplete={(url) => form.setValue("logo", url)}
                  />
                ) : (
                  <ImageUploadDialog
                    onUploadComplete={(url) => {
                      form.setValue("logo", url, { shouldValidate: true });
                    }}
                  >
                    <Button type="button" variant="outline" size="sm">
                      Upload Logo
                    </Button>
                  </ImageUploadDialog>
                )}
              </div>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={updateWorkspaceMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={updateWorkspaceMutation.isPending}
            type="submit"
            form="update-workspace-form"
          >
            {updateWorkspaceMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Updating
                workspace...
              </>
            ) : (
              <>Update Workspace</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
