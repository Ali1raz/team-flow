"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import { Ban, Loader2, RefreshCcw } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InvitationTableActionsDropdown } from "./invitation-table-actions-dropdown";
import { UserImage } from "@/components/general/user-avatar";
import { MemberRoleBadge } from "@/components/general/member-role-badge";
import { formatLocalDateTime } from "@/lib/utils";
import { formatDynamicAPIAccesses } from "next/dist/server/app-render/dynamic-rendering";

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  canceled: "outline",
};

export function InvitationList({ workspaceId }: { workspaceId: string }) {
  const {
    data: { invitations },
    isFetching,
    refetch,
  } = useSuspenseQuery(
    orpc.workspace.invitations.list.queryOptions({ input: { workspaceId } })
  );

  return (
    <div className="flex w-full mt-10 max-w-6xl flex-col gap-4">
      <Button
        onClick={() => refetch({})}
        disabled={isFetching}
        className="w-fit"
      >
        {isFetching ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCcw className="size-4" />
        )}{" "}
        {isFetching ? "Refreshing..." : "Refresh"}
      </Button>
      {(!invitations || invitations.length === 0) && !isFetching ? (
        <div className="flex items-center justify-center h-full">
          <Empty className="h-full bg-muted/40 py-24">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="bg-muted rounded-full size-28"
              >
                <Ban className="sm:size-14 size-8" />
              </EmptyMedia>
              <EmptyTitle className="sm:text-4xl sm:mt-6 mt-4 text-2xl">
                No invitations found.
              </EmptyTitle>
              <EmptyDescription className="sm:w-xl w-sm sm:text-lg text-xs">
                There are no invitations. Start by creating a new invitation.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : isFetching ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead>Invited User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="flex flex-row gap-1 items-center">
                  <UserImage
                    image={invitation.invitedUser?.image}
                    name={invitation.invitedUser?.name}
                  />
                  <div className="flex flex-col">
                    <span className="max-w-30 truncate">
                      {invitation.invitedUser?.name}
                    </span>
                    <span className="truncate text-muted-foreground text-sm max-w-48">
                      {invitation.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <MemberRoleBadge role={invitation.role ?? "member"} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant[invitation.status] ?? "outline"}
                    className="capitalize"
                  >
                    {invitation.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex flex-row gap-1 items-center">
                  <UserImage
                    image={invitation.inviter?.image}
                    name={invitation.inviter?.name}
                  />
                  <div className="flex flex-col">
                    <span className="max-w-30 truncate">
                      {invitation.inviter?.name}
                    </span>
                    <span className="truncate text-muted-foreground text-sm max-w-48">
                      {invitation.inviter?.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {invitation.team ? (
                    <Badge variant="secondary" className="truncate max-w-32">
                      {invitation.team.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatLocalDateTime(invitation.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatLocalDateTime(invitation.expiresAt)}
                </TableCell>
                <TableCell>
                  <InvitationTableActionsDropdown
                    invitationId={invitation.id}
                    workspaceId={workspaceId}
                    invitationEmail={invitation.email}
                    status={invitation.status}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
