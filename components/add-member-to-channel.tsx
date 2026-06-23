"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { ScrollArea } from "./ui/scroll-area";
import { UserImage } from "./general/user-avatar";
import { Info, Loader2 } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "./ui/field";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { Badge } from "./ui/badge";

export function AddMemberToChannel({
  channelId,
  children,
  organizationId,
}: {
  channelId: string;
  children?: React.ReactNode;
  organizationId: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: { members },
  } = useSuspenseQuery(orpc.workspace.members.list.queryOptions());

  const {
    data: { members: channelMembers },
  } = useSuspenseQuery(
    orpc.channel.members.list.queryOptions({ input: { channelId } })
  );
  const channelMemberIds = new Set(channelMembers.map((m) => m.id));

  const nonChannelMembers = members.filter((m) => !channelMemberIds.has(m.id));

  const allSelected =
    selected.size === nonChannelMembers.length && nonChannelMembers.length > 0;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(nonChannelMembers.map((m) => m.id)));
    }
  }

  function toggleMember(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  const queryClient = useQueryClient();

  const addMemberMutation = useMutation(
    orpc.channel.members.add.mutationOptions({
      onSuccess: () => {
        toast.success("Members added successfully!");
        queryClient.invalidateQueries({
          queryKey: orpc.channel.members.list.queryKey({
            input: { channelId },
          }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.channel.list.queryKey({
            input: { organizationId },
          }),
        });
        setSelected(new Set());
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to add members", { description: error.message });
      },
    })
  );

  function handleAdd() {
    addMemberMutation.mutate({
      channelId,
      memberIds: [...selected],
    });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSelected(new Set());
      }}
    >
      <DialogTrigger asChild>
        {children ?? <Button>Add Member</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Member to Channel</DialogTitle>
        <DialogDescription>
          Following are the all workspace members, choose from them, or invite
          new users.
          <HoverCard>
            <HoverCardTrigger>
              <Info className="size-4 animate-in" />
            </HoverCardTrigger>
            <HoverCardContent align="start">
              <p>Selected members are already in this channel.</p>
            </HoverCardContent>
          </HoverCard>
        </DialogDescription>
        <div className="flex items-center justify-between w-full">
          <h3>
            {selected.size > 0 ? `Selected: (${selected.size})` : "Select"}
          </h3>

          <FieldGroup className="w-24">
            <Field
              orientation="horizontal"
              className="flex flex-row items-center gap-1"
            >
              <FieldLabel htmlFor="select-all">Select All</FieldLabel>
              <Checkbox
                id="select-all"
                checked={
                  allSelected
                    ? true
                    : someSelected && !allSelected
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={toggleAll}
              />
            </Field>
          </FieldGroup>
        </div>
        <ScrollArea className="max-h-56 flex-col flex gap-4 min-h-0 w-full">
          {members.map((member) => (
            <FieldLabel key={member.id} className="not-last:mb-2">
              <Field className="relative inset-0">
                <FieldContent className="flex flex-row items-center gap-2">
                  <UserImage image={member.image} name={member.name} />
                  <div className="flex flex-col gap-1">
                    <FieldTitle>
                      <span>{member.name}</span>
                      <Badge variant="ghost">{member.role}</Badge>
                    </FieldTitle>
                    <FieldDescription>{member.email}</FieldDescription>
                  </div>
                  <Checkbox
                    id={`toggle-checkbox-${member.id}`}
                    name={`toggle-checkbox-${member.id}`}
                    className="absolute bottom-4 right-4"
                    checked={
                      channelMemberIds.has(member.id) || selected.has(member.id)
                    }
                    disabled={channelMemberIds.has(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </FieldContent>
              </Field>
            </FieldLabel>
          ))}
        </ScrollArea>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={addMemberMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>

          {/* Destructive confirm button */}
          <Button
            onClick={handleAdd}
            disabled={selected.size === 0 || addMemberMutation.isPending}
          >
            {addMemberMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Adding...
              </>
            ) : (
              `Add`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
