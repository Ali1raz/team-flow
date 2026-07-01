"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CancelInvitationDialog } from "@/app/(workspace)/workspaces/[workspaceId]/invitations/_components/cancel-invitation-dialog";
import { MoreHorizontal } from "lucide-react";

export function InvitationTableActionsDropdown({
  invitationId,
  workspaceId,
  invitationEmail,
  status,
}: {
  invitationId: string;
  workspaceId: string;
  invitationEmail: string;
  status: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <CancelInvitationDialog
          invitationId={invitationId}
          workspaceId={workspaceId}
          invitationEmail={invitationEmail}
        >
          <DropdownMenuItem
            disabled={status !== "pending"}
            onSelect={(e) => e.preventDefault()}
            variant="destructive"
          >
            Cancel invitation
          </DropdownMenuItem>
        </CancelInvitationDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
