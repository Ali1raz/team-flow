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
import { orpc } from "@/lib/orpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

export function LeaveWorkspaceDialog({
  children,
  workspaceId,
}: {
  children?: ReactNode;
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const queryClient = useQueryClient();

  const leaveWorkspaceMutation = useMutation(
    orpc.workspace.leave.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.members.list.queryKey(),
        });

        router.push("/workspaces");
        toast.success("Workspace left successfully!");
        setOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to leave workspace", {
          description: error.message,
        });
      },
    })
  );

  function handleConfirm() {
    leaveWorkspaceMutation.mutate({ organizationId: workspaceId });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="destructive" size="sm">
            Leave Workspace
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this workspace? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={leaveWorkspaceMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>

          {/* Destructive confirm button */}
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={leaveWorkspaceMutation.isPending}
          >
            {leaveWorkspaceMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Please wait...
              </>
            ) : (
              "Leave Workspace"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
