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
import { teamType } from "./update-team-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export function DeleteTeamDialog({
  team,
  children,
  className,
}: {
  team: teamType;
  children?: React.ReactNode;
  className?: React.ComponentProps<typeof Button>["className"];
}) {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteTeamMutation = useMutation(
    orpc.team.delete.mutationOptions({
      onSuccess: (ch) => {
        toast.success(`Team ${team.name} Deleted successfully!`);
        queryClient.invalidateQueries({
          queryKey: orpc.team.list.queryKey({
            input: { organizationId: ch.organizationId },
          }),
        });

        if (teamId === team.id)
          router.push(`/organizations/${ch.organizationId}`);

        setOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to delete team", {
          description: error.message,
        });
      },
    })
  );

  function handleConfirm() {
    deleteTeamMutation.mutate({ teamId: team.id });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={cn(className)} variant="destructive" size="sm">
            <Trash2 className="size-4" /> Delete Team
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-100">
        <DialogHeader className="text-xs text-muted-foreground">
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure to delete{" "}
            <span className="font-bold text-destructive">{team.name}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          {/* Cancel — dismiss without doing anything */}
          <DialogClose asChild>
            <Button variant="outline" disabled={deleteTeamMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>

          {/* Destructive confirm button */}
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteTeamMutation.isPending}
          >
            {deleteTeamMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting Team...
              </>
            ) : (
              "Delete Team"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
