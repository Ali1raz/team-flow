"use client";

import { toast } from "sonner";
import { ReactNode, useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InfoIcon, Loader2 } from "lucide-react";
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
import { inviteMemberSchema, InviteMemberSchemaType } from "../schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MembershipRole } from "@/generated/prisma/enums";
import { client, orpc } from "@/lib/orpc";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import {
  HoverCardTrigger,
  HoverCardContent,
  HoverCard,
} from "@/components/ui/hover-card";

export function InviteWorkspaceDialog({
  children,
  workspaceId,
  workspaceName,
  channels,
  channelId,
}: {
  children?: ReactNode;
  workspaceId: string | undefined;
  workspaceName: string | undefined;
  channels: Awaited<ReturnType<typeof client.channel.list>>["channels"];
  channelId: string | undefined;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<InviteMemberSchemaType>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
      organizationId: workspaceId,
      resend: true,
      teamId: channelId || null,
    },
    mode: "onChange",
  });

  const createInviteMutation = useMutation(
    orpc.workspace.members.invite.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation sent successfully!");
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        toast.error("Something bad happened, please try again!", {
          description: error instanceof Error ? error.message : null,
        });
      },
    })
  );

  if (!workspaceId || !channels) return null;

  function onSubmit(values: InviteMemberSchemaType) {
    createInviteMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button>Invite a member</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            Invite a member to your workspace.
          </DialogDescription>
        </DialogHeader>
        <form id="invite-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid && fieldState.isTouched}
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                    <HoverCard openDelay={10} closeDelay={100}>
                      <HoverCardTrigger>
                        <InfoIcon className="size-4" />
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="space-y-2 *:text-sm *:text-muted-foreground"
                        align="center"
                        side="top"
                      >
                        <p>owner: Full access.</p>
                        <p>
                          admin: Full access except delete workspace/change
                          owner.
                        </p>
                        <p>member: read-only on workspace data.</p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <Select
                    defaultValue="member"
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select a role</SelectLabel>
                        {Object.values(MembershipRole).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="organizationId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Organization
                    <span className="text-muted-foreground">
                      (currently active)
                    </span>
                  </FieldLabel>
                  <Select defaultValue={workspaceId} disabled={!!workspaceId}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select an organization"
                        defaultValue={workspaceId}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select an organization</SelectLabel>
                        <SelectItem value={workspaceId}>
                          {workspaceName}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="teamId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Channel</FieldLabel>
                  <Select
                    defaultValue={channelId}
                    onValueChange={(value) =>
                      value ? field.onChange(value) : null
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select a channel"
                        defaultValue={channelId}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select a channel</SelectLabel>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="resend"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                >
                  <Checkbox
                    id={field.name}
                    onCheckedChange={field.onChange}
                    checked={field.value}
                    aria-invalid={fieldState.invalid && fieldState.isTouched}
                  />
                  <FieldLabel htmlFor={field.name}>
                    Resend Invitation (if already sent)
                  </FieldLabel>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <Field className="mt-4">
          <Button
            disabled={createInviteMutation.isPending}
            type="submit"
            form="invite-form"
          >
            {createInviteMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending
                invitation...
              </>
            ) : (
              <>Invite Member</>
            )}
          </Button>
        </Field>
      </DialogContent>
    </Dialog>
  );
}
