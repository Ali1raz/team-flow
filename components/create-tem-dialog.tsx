"use client";

import { Plus } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { createSlug } from "@/lib/utils";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  createChannelSchema,
  CreateChannelType,
} from "@/app/(workspace)/workspaces/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateChannelType>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  const channelName = useWatch({
    control: form.control,
    name: "name",
  });

  const slug = createSlug(channelName ?? "");
  const queryClient = useQueryClient();

  const createChannelMutation = useMutation(
    orpc.channel.create.mutationOptions({
      onSuccess: (newChannel) => {
        toast.success(`Channel ${newChannel.name} created successfully!`);
        form.reset();
        queryClient.invalidateQueries({
          queryKey: orpc.channel.list.queryKey({
            input: { organizationId: newChannel.organizationId },
          }),
        });
        setOpen(false);
      },
      onError: (error) => {
        toast.error("Something bad happened, please try again!", {
          description: error instanceof Error ? error.message : null,
        });
      },
    })
  );

  function onSubmit(values: CreateChannelType) {
    createChannelMutation.mutate(values);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <SidebarMenuButton asChild className="w-full px-1.5">
              <Button variant="outline">
                <Plus className="size-4" /> Create Channel
              </Button>
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-100">
            <DialogHeader className="text-xs text-muted-foreground">
              <DialogTitle>Create Channel</DialogTitle>
              <DialogDescription>
                Create new channel to get started
              </DialogDescription>
            </DialogHeader>
            <form id="channel-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                        aria-invalid={
                          fieldState.invalid && fieldState.isTouched
                        }
                        autoComplete="team-name"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {slug && (
                  <p>
                    will be created as:{" "}
                    <code className="bg-muted text-muted-foreground px-1 w-fit">
                      {slug}
                    </code>
                  </p>
                )}
              </FieldGroup>
            </form>

            <Field className="mt-4">
              <Button
                disabled={createChannelMutation.isPending}
                type="submit"
                form="channel-form"
              >
                {createChannelMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Creating
                    Channel...
                  </>
                ) : (
                  <>Create Channel</>
                )}
              </Button>
            </Field>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
