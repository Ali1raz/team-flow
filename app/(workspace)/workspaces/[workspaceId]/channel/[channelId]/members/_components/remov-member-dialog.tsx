"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

export function RemoveMemberDialog({
  channelId,
  organizationId,
  memberId,
  memberName,
  children,
}: {
  channelId: string;
  organizationId: string;
  memberId: string;
  memberName: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const removeMemberMutation = useMutation(
    orpc.channel.members.remove.mutationOptions({
      onSuccess: () => {
        toast.success(`${memberName} removed from channel`);
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
        setOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to remove member", { description: error.message });
      },
    })
  );

  function handleConfirm() {
    removeMemberMutation.mutate({ channelId, memberId });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            Remove Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-100">
        <DialogTitle>Remove Member from this channel</DialogTitle>
        <DialogDescription>
          Are you sure to remove{" "}
          <span className="font-bold text-destructive">{memberName}</span> from
          this channel?
        </DialogDescription>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={removeMemberMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={removeMemberMutation.isPending}
          >
            {removeMemberMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
