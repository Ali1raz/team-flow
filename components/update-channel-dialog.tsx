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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/lib/orpc";
import { UpdateChannelType, updateChannelSchema } from "@/lib/schema";

export type channelType = Awaited<
  ReturnType<typeof client.channel.list>
>["channels"][number];

export function UpdateChannelDialog({
  className,
  channel,
  children,
}: {
  className?: React.ComponentProps<typeof Button>["className"];
  channel: channelType;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateChannelType>({
    resolver: zodResolver(updateChannelSchema),
    defaultValues: {
      name: channel.name,
      chanelId: channel.id,
    },
    mode: "onChange",
  });

  const channelName = useWatch({
    control: form.control,
    name: "name",
  });

  const slug = createSlug(channelName ?? "");

  const queryClient = useQueryClient();

  const updateChannleMutation = useMutation(
    orpc.channel.update.mutationOptions({
      onSuccess: (channel) => {
        toast.success(`Channel "${channel.name}" has been updated.`);

        form.reset();
        queryClient.invalidateQueries({
          queryKey: orpc.channel.list.queryKey({
            input: { organizationId: channel.organizationId },
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

  function onSubmit(values: UpdateChannelType) {
    updateChannleMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={cn(className)} variant="outline" size="sm">
            <Plus className="size-4" /> Update Channel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-100">
        <DialogHeader className="text-xs text-muted-foreground">
          <DialogTitle>Update Channel</DialogTitle>
          <DialogDescription>Update channel details</DialogDescription>
        </DialogHeader>
        <form id="update-channel-form" onSubmit={form.handleSubmit(onSubmit)}>
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
            disabled={updateChannleMutation.isPending}
            type="submit"
            form="update-channel-form"
          >
            {updateChannleMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Updating Channel...
              </>
            ) : (
              <>Update Channel</>
            )}
          </Button>
        </Field>
      </DialogContent>
    </Dialog>
  );
}
