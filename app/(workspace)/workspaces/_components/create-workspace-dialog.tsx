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
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createWorkspaceSchema, CreateWorkspaceType } from "../schema";
import { toast } from "sonner";
import { ReactNode, useState } from "react";
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

export function CreateWorkspaceDialog({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateWorkspaceType>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  const workspaceName = useWatch({
    control: form.control,
    name: "name",
  });
  const slug = createSlug(workspaceName ?? "");
  const queryClient = useQueryClient();

  const createWorkspaceMutation = useMutation(
    orpc.workspace.create.mutationOptions({
      onSuccess: (workspace) => {
        toast.success(`${workspace.name} workspace created successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.list.queryKey(),
        });
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error("Something bad happened, please try again!", {
          description: error instanceof Error ? error.message : null,
        });
      },
    })
  );

  function onSubmit(values: CreateWorkspaceType) {
    createWorkspaceMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button>Create Workspace</Button>}
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
            <Field>
              {/* Show the derived slug so users can preview what will be created. */}
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <Input id="slug" value={slug} readOnly />
            </Field>
          </FieldGroup>
        </form>

        <Field className="mt-4">
          <Button
            disabled={createWorkspaceMutation.isPending}
            type="submit"
            form="workspace-form"
          >
            {createWorkspaceMutation.isPending ? (
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
