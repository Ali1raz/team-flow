"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Ban,
  Check,
  Loader2,
  MoreHorizontal,
  RefreshCcw,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { cn, getWorkspaceColor } from "@/lib/utils";
import { MemberRoleBadge } from "@/components/general/member-role-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteWorkspaceDialog } from "@/components/delete-workspace-dialog";
import { UpdateWorkspaceDialog } from "./update-workspace-dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function WorkspaceList() {
  const [isPending, startTransition] = useTransition();

  const {
    data: { workspaces, currentWorkspace },
    isFetching,
    refetch,
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const queryClient = useQueryClient();

  const activeWorkspace =
    workspaces.find((w) => w.id === currentWorkspace?.id) ?? currentWorkspace;

  const router = useRouter();

  async function handleSwitch(workspaceId: string) {
    startTransition(async () => {
      const { data, error } = await authClient.organization.setActive({
        organizationId: workspaceId,
      });

      if (error) {
        toast.error("Failed to switch workspace!", {
          description: error.message ?? "Unknown error",
        });
        return;
      }

      toast.success(
        `Switched to ${data.name} workspace successfully, Redirecting please wait...`
      );
      router.push(`/workspaces/${data.id}`);
      await queryClient.invalidateQueries(orpc.workspace.list.queryOptions());
    });
  }

  return (
    <div className="flex w-full mx-auto mt-10 max-w-4xl flex-col gap-4">
      <Button
        onClick={() => refetch({})}
        disabled={isFetching || isPending}
        className="w-fit"
      >
        {isFetching ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCcw className="size-4" />
        )}{" "}
        {isFetching ? "Refreshing..." : "Refresh"}
      </Button>
      {(!workspaces || workspaces?.length === 0) && !isFetching && (
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
                No workspaces found.
              </EmptyTitle>
              <EmptyDescription className="sm:w-xl w-sm sm:text-lg text-xs">
                There are no workspaces. Start by creating a new workpace and
                inviting friends to start chatting.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      {isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="w-full h-26" />
          <Skeleton className="w-full h-26" />
          <Skeleton className="w-full h-26" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              className={cn(
                "w-full",
                ws.id === activeWorkspace?.id &&
                  "outline-2 outline-offset-4 outline-primary/40"
              )}
            >
              <CardHeader className="flex gap-2 items-start">
                {ws.logo ? (
                  <div className="size-8 relative overflow-hidden rounded-full">
                    <Image
                      alt={ws.name}
                      src={ws.logo}
                      width={20}
                      height={20}
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "size-8 rounded-full transition-all duration-100",
                      getWorkspaceColor(ws.id)
                    )}
                  />
                )}
                <div className="space-y-1">
                  <CardTitle>
                    <h1 className="line-clamp-1 truncate">
                      {ws.id === activeWorkspace?.id ? (
                        <Link
                          className="font-bold flex items-center gap-1 underline hover:underline-primary"
                          href={`/workspaces/${ws.id}`}
                        >
                          {ws.name} <ArrowUpRight className="size-4" />
                        </Link>
                      ) : (
                        `${ws.name}`
                      )}
                    </h1>
                  </CardTitle>
                  <CardDescription>
                    <p>Total Members: {ws.totalMembers}</p>
                    <p>Total Channels: {ws.totalChannels}</p>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <MemberRoleBadge role={ws.role} />
                  {ws.id === activeWorkspace?.id && (
                    <Badge variant="secondary">
                      <Check /> Active
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <CardAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-52">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Workspace options</DropdownMenuLabel>
                        {ws.id !== activeWorkspace?.id && (
                          <DropdownMenuItem onClick={() => handleSwitch(ws.id)}>
                            Switch to this Workspace
                          </DropdownMenuItem>
                        )}
                        {ws.role !== "member" && (
                          <>
                            <UpdateWorkspaceDialog
                              workspaceId={ws.id}
                              currentName={ws.name}
                              currentLogo={ws.logo}
                            >
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                Update Workspace
                              </DropdownMenuItem>
                            </UpdateWorkspaceDialog>
                            <DropdownMenuSeparator />
                            <DeleteWorkspaceDialog workspaceId={ws.id}>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                variant="destructive"
                              >
                                Delete Workspace
                              </DropdownMenuItem>
                            </DeleteWorkspaceDialog>{" "}
                          </>
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
