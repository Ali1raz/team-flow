"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FolderCode, Loader2, RefreshCcw } from "lucide-react";
import { CreateTeamDialog } from "@/components/create-tem-dialog";
import { ChannelCard } from "./channel-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaveWorkspaceDialog } from "./leave-workspace-dialog";

export function ChannelList({ workspaceId }: { workspaceId: string }) {
  const {
    data: { channels },
    isFetching,
    refetch,
  } = useSuspenseQuery(
    orpc.channel.list.queryOptions({ input: { organizationId: workspaceId } })
  );

  const { data: user } = useQuery(orpc.user.get.queryOptions());

  return (
    <div className="p-4 sm:p-6 max-w-4xl h-full w-full">
      <div className="flex gap-2 sm:flex-row sm:justify-between sm:items-baseline items-start flex-col">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl">Channels</h1>
          <p className="text-muted-foreground text-sm">
            Channels in this workspace
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch({})}
            disabled={isFetching}
            className="w-fit"
            size="sm"
          >
            {isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCcw className="size-4" />
            )}
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <LeaveWorkspaceDialog workspaceId={workspaceId} />
        </div>
      </div>
      {isFetching ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="w-full h-24" />
          <Skeleton className="w-full h-24" />
          <Skeleton className="w-full h-24" />
        </div>
      ) : channels.length === 0 ? (
        <Empty className="h-120 mt-4 bg-muted/40">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-muted rounded-full size-28"
            >
              <FolderCode className="size-14" />
            </EmptyMedia>
            <EmptyTitle className="sm:text-4xl text-2xl sm:mt-8 mt-4">
              No channel found!
            </EmptyTitle>
            <EmptyDescription className="text-pretty">
              No channel found in this workspace, once created channels will
              appear here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {user && user.role !== "member" && <CreateTeamDialog />}
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-4 space-y-2">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
