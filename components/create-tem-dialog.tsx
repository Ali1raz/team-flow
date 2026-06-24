"use client";

import { Plus } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { cn, createSlug } from "@/lib/utils";
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
import { useRouter } from "next/navigation";

export function CreateTeamDialog({
  className,
  children,
}: {
  className?: React.ComponentProps<typeof Button>["className"];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
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
        router.push(
          `/workspaces/${newChannel.organizationId}/channel/${newChannel.id}`
        );
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className={cn(className)} variant="outline" size="sm">
            <Plus className="size-4" /> Create Channel
          </Button>
        )}
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
                    aria-invalid={fieldState.invalid && fieldState.isTouched}
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
                <Loader2 className="size-4 animate-spin" /> Creating Channel...
              </>
            ) : (
              <>Create Channel</>
            )}
          </Button>
        </Field>
      </DialogContent>
    </Dialog>
  );
}
