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
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

import { useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { authClient } from "@/lib/auth-client";

export function DeleteWorkspaceDialog({
  className,
  workspaceId,
  children,
}: {
  className?: React.ComponentProps<typeof Button>["className"];
  workspaceId: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const queryClient = useQueryClient();

  function onSubmit() {
    startTransition(async () => {
      const { error } = await authClient.organization.delete({
        organizationId: workspaceId,
      });

      if (error) {
        toast.error(error.message ?? "Failed to delete workspace");
        return;
      }
      await queryClient.invalidateQueries(orpc.workspace.list.queryOptions());
      toast.success(`Deleted workspace successfully!`);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={cn(className)} variant="destructive" size="sm">
            <Trash2 className="size-4" /> Delete Workspace
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-100">
        <DialogHeader className="text-xs text-muted-foreground">
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this workspace?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          <DialogClose asChild disabled={isPending}>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={isPending}
            type="submit"
            variant="destructive"
            onClick={onSubmit}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Deleting
                Workspace...
              </>
            ) : (
              <>Delete Workspace</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
