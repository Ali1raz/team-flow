"use client";

import { UserImage } from "@/components/general/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/lib/orpc";
import { Loader2, MoreHorizontal, RefreshCcw } from "lucide-react";
import { RemoveMemberDialog } from "./_components/remov-member-dialog";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AddMemberToChannel } from "@/components/add-member-to-channel";
import { usePresence } from "@/hooks/use-presence";
import { RealtimeUserSchemaType } from "@/realtime/schema";
import { useMemo } from "react";
import { MemberRoleBadge } from "@/components/general/member-role-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChannelMembersPage() {
  const { channelId, workspaceId } = useParams<{
    channelId: string;
    workspaceId: string;
  }>();

  const {
    data: { members },
    isFetching,
    refetch,
  } = useSuspenseQuery(
    orpc.channel.members.list.queryOptions({ input: { channelId } })
  );

  const { data } = useQuery(orpc.workspace.list.queryOptions());

  const currentUser = data?.user
    ? ({ id: data.user.id } satisfies RealtimeUserSchemaType)
    : null;

  const { onlineusers } = usePresence({
    room: workspaceId,
    user: currentUser,
  });

  const onlineUserIds = useMemo(
    () => new Set(onlineusers.map((user) => user.id)),
    [onlineusers]
  );

  return (
    <div className="p-4 sm:px-6 sm:max-w-4xl w-full space-x-2">
      <div className="flex sm:items-baseline gap-2 sm:justify-between flex-col sm:flex-row">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-muted-foreground">
            Members in this channel
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch({})}
            disabled={isFetching}
            className="w-fit"
          >
            {isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCcw className="size-4" />
            )}
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <AddMemberToChannel
            channelId={channelId}
            organizationId={workspaceId}
          >
            <Button className="w-fit">Add Member</Button>
          </AddMemberToChannel>
        </div>
      </div>

      {isFetching ? (
        <div className="space-y-3 mt-4">
          <Skeleton className="w-full h-22" />
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader className="flex flex-row items-center gap-2 w-full">
                <UserImage
                  image={member.image}
                  name={member.name}
                  isOnline={!!member.id && onlineUserIds.has(member.id)}
                  showOnline={true}
                />
                <div className="flex flex-col gap-1 w-full">
                  <CardTitle className="flex items-center gap-2">
                    <span>{member.name}</span>
                    <MemberRoleBadge role={member.role} />
                  </CardTitle>
                  <CardDescription>{member.email}</CardDescription>
                </div>

                <CardAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <RemoveMemberDialog
                        channelId={channelId}
                        organizationId={workspaceId}
                        memberId={member.id}
                        memberName={member.name}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          variant="destructive"
                        >
                          Remove
                        </DropdownMenuItem>
                      </RemoveMemberDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
