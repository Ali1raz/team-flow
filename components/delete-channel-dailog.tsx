"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { channelType } from "./update-channel-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export function DeleteChannelDialog({
  channel,
  children,
  className,
}: {
  channel: channelType;
  children?: React.ReactNode;
  className?: React.ComponentProps<typeof Button>["className"];
}) {
  const { channelId } = useParams<{ channelId: string }>();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteChannelMutation = useMutation(
    orpc.channel.delete.mutationOptions({
      onSuccess: (ch) => {
        toast.success(`Channel ${channel.name} Deleted successfully!`);
        queryClient.invalidateQueries({
          queryKey: orpc.channel.list.queryKey({
            input: { organizationId: ch.organizationId },
          }),
        });

        if (channelId === channel.id)
          router.push(`/workspaces/${ch.organizationId}`);

        setOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to delete channel", {
          description: error.message,
        });
      },
    })
  );

  function handleConfirm() {
    deleteChannelMutation.mutate({ channelId: channel.id });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={cn(className)} variant="destructive" size="sm">
            <Trash2 className="size-4" /> Delete Channel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-100">
        <DialogHeader className="text-xs text-muted-foreground">
          <DialogTitle>Delete Channel</DialogTitle>
          <DialogDescription>
            Are you sure to delete{" "}
            <span className="font-bold text-destructive">{channel.name}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          {/* Cancel — dismiss without doing anything */}
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={deleteChannelMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>

          {/* Destructive confirm button */}
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteChannelMutation.isPending}
          >
            {deleteChannelMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting Channel...
              </>
            ) : (
              "Delete Channel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
