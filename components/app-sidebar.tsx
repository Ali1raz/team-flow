"use client";
import * as React from "react";

import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { ChevronRight, Hash, MoreHorizontal } from "lucide-react";
import { UserImage } from "./general/user-avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";
import { useParams } from "next/navigation";
import { CreateTeamDialog } from "./create-tem-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { InviteWorkspaceDialog } from "@/app/(workspace)/workspaces/_components/invite-workspace-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UpdateChannelDialog } from "./update-channel-dialog";
import { DeleteChannelDialog } from "./delete-channel-dailog";
import { AddMemberToChannel } from "./add-member-to-channel";

export function AppSidebar({
  organizationId,
  ...props
}: React.ComponentProps<typeof Sidebar> & { organizationId: string }) {
  const {
    data: { channels },
  } = useSuspenseQuery(
    orpc.channel.list.queryOptions({ input: { organizationId } })
  );
  const {
    data: { members },
  } = useSuspenseQuery(orpc.workspace.members.list.queryOptions());

  const {
    data: { currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const { channelId } = useParams<{ channelId: string }>();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="space-y-4">
        <WorkspaceSwitcher />
        <SidebarMenu className="flex items-center gap-2 w-full flex-row">
          <SidebarMenuItem className="flex-1 min-w-0">
            <SidebarMenuButton asChild>
              <CreateTeamDialog className="w-full" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex sm:hidden">
            <SidebarMenuButton asChild className="shrink-0">
              <InviteWorkspaceDialog
                workspaceId={organizationId}
                channelId={channelId}
                channels={channels}
                workspaceName={currentWorkspace?.name || ""}
              >
                <Button size="sm">Invite</Button>
              </InviteWorkspaceDialog>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col overflow-hidden h-full">
        {/* Channels */}
        <SidebarGroup className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <SidebarMenu className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Collapsible
              defaultOpen
              className="group/collapsible flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  Channels
                  <ChevronRight className="ml-auto transition-transform duration-100 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {/* Keep flex sizing on a stable wrapper so Radix's internal content div cannot break scroll height propagation. */}
              <SidebarMenuItem className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0">
                  <CollapsibleContent className="h-full overflow-hidden">
                    <ScrollArea className="h-full">
                      <SidebarMenuSub>
                        {channels &&
                          channels.map((ch) => (
                            <SidebarMenuSubItem
                              key={ch.id}
                              className="flex items-center justify-between gap-1"
                            >
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "text-muted-foreground hover:bg-muted flex-1 cursor-pointer",
                                  channelId === ch.id &&
                                    "bg-accent text-accent-foreground"
                                )}
                              >
                                <Link
                                  href={`/workspaces/${organizationId}/channel/${ch.id}`}
                                  className={cn(
                                    "flex items-center justify-between",
                                    channelId === ch.id && "font-medium"
                                  )}
                                  title={ch.name}
                                >
                                  <p className="flex items-center w-[15ch] gap-2">
                                    <Hash className="size-4 shrink-0" />
                                    <span className="truncate">{ch.name}</span>
                                  </p>
                                </Link>
                              </SidebarMenuSubButton>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <SidebarMenuAction>
                                    <MoreHorizontal />
                                    <span className="sr-only">More</span>
                                  </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-20">
                                  <UpdateChannelDialog channel={ch}>
                                    <DropdownMenuItem
                                      onSelect={(event) =>
                                        event.preventDefault()
                                      }
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                  </UpdateChannelDialog>
                                  <AddMemberToChannel
                                    organizationId={organizationId}
                                    channelId={ch.id}
                                  >
                                    <DropdownMenuItem
                                      onSelect={(event) =>
                                        event.preventDefault()
                                      }
                                    >
                                      Add Member
                                    </DropdownMenuItem>
                                  </AddMemberToChannel>
                                  <DropdownMenuItem
                                    onSelect={(event) => event.preventDefault()}
                                  >
                                    <Link
                                      href={`/workspaces/${organizationId}/channel/${ch.id}/members`}
                                    >
                                      Manage Members
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DeleteChannelDialog channel={ch}>
                                    <DropdownMenuItem
                                      onSelect={(event) =>
                                        event.preventDefault()
                                      }
                                      variant="destructive"
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DeleteChannelDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                    </ScrollArea>
                  </CollapsibleContent>
                </div>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {/* Members */}
        <SidebarGroup className="shrink-0 flex flex-col border-t bg-accent/40 pb-4">
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    Members
                    <ChevronRight className="ml-auto transition-transform duration-100 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ScrollArea className="h-64">
                    <SidebarMenuSub className="flex gap-2">
                      {members?.map((user) => (
                        <SidebarMenuSubItem
                          key={user.id}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-accent truncate"
                        >
                          <UserImage
                            name={user.name}
                            image={user.image}
                            className="size-8 object-cover"
                          />
                          <div className="flex flex-col flex-1 max-w-[15ch] gap-1">
                            <span className="leading-none">
                              {user.name}
                              <Badge
                                variant={
                                  user.role === "owner"
                                    ? "default"
                                    : user.role === "admin"
                                      ? "outline"
                                      : "ghost"
                                }
                              >
                                {user.role}
                              </Badge>
                            </span>
                            <span className="text-sm leading-none truncate text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </ScrollArea>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
