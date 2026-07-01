"use client";
import { useMemo } from "react";

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
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { ChevronRight, Hash, MoreVertical } from "lucide-react";
import { UserImage } from "./general/user-avatar";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";
import { useParams } from "next/navigation";
import { CreateTeamDialog } from "./create-tem-dialog";
import { Button, buttonVariants } from "./ui/button";
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
import { usePresence } from "@/hooks/use-presence";
import { UpdateMemberRoleDialog } from "@/components/update-member-role-dialog";

import type { ClientOutputs } from "@/lib/orpc";
import { MemberRoleBadge } from "./general/member-role-badge";
import { MembershipRole } from "@/generated/prisma/enums";

type MembersListOutput = ClientOutputs["workspace"]["members"]["list"];
type MemberType = MembersListOutput["members"][number];

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

  const { data: user } = useQuery(orpc.user.get.queryOptions());

  const { onlineusers } = usePresence({
    room: organizationId,
    user: user ? { id: user.id } : null,
  });

  const onlineUserIds = useMemo(
    () => new Set(onlineusers.map((u) => u.id)),
    [onlineusers]
  );

  const {
    data: { currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const { channelId } = useParams<{ channelId: string }>();

  const canManageWorkspace = !!user && user.role !== "member";

  return (
    <Sidebar {...props}>
      <SidebarHeader className="space-y-4">
        <WorkspaceSwitcher />
        <SidebarMenu className="flex items-center gap-2 w-full flex-row">
          {canManageWorkspace && (
            <SidebarMenuItem className="flex-1 min-w-0">
              <SidebarMenuButton asChild>
                <CreateTeamDialog className="w-full" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {canManageWorkspace && (
            <SidebarMenuItem className="flex sm:hidden">
              <SidebarMenuButton asChild className="shrink-0">
                <InviteWorkspaceDialog
                  workspaceId={organizationId}
                  channelId={channelId}
                  channels={channels}
                  workspaceName={currentWorkspace?.name || ""}
                />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
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
                            <SidebarMenuSubItem key={ch.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={channelId === ch.id}
                                className="text-muted-foreground flex-1"
                              >
                                <Link
                                  href={`/workspaces/${organizationId}/channel/${ch.id}`}
                                  title={ch.name}
                                >
                                  <Hash className="size-4 shrink-0" />
                                  <span className="truncate max-w-[12ch]">
                                    {ch.name}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>

                              {canManageWorkspace && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    className="flex items-center justify-center"
                                    asChild
                                  >
                                    <SidebarMenuAction
                                      className={buttonVariants({
                                        variant: "ghost",
                                        size: "sm",
                                      })}
                                    >
                                      <MoreVertical />
                                      <span className="sr-only">More</span>
                                    </SidebarMenuAction>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-48">
                                    <UpdateChannelDialog channel={ch}>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Edit
                                      </DropdownMenuItem>
                                    </UpdateChannelDialog>
                                    <AddMemberToChannel
                                      organizationId={organizationId}
                                      channelId={ch.id}
                                    >
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Add Member
                                      </DropdownMenuItem>
                                    </AddMemberToChannel>
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/workspaces/${organizationId}/channel/${ch.id}/members`}
                                      >
                                        Manage Members
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DeleteChannelDialog channel={ch}>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        variant="destructive"
                                      >
                                        Delete channel
                                      </DropdownMenuItem>
                                    </DeleteChannelDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
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
                      {members?.map((member) => (
                        <SidebarMenuSubItem
                          key={member.id}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-accent truncate"
                        >
                          <UserImage
                            name={member.name}
                            image={member.image}
                            className="size-8 object-cover"
                            isOnline={
                              !!member.id && onlineUserIds.has(member.id)
                            }
                            showOnline={true}
                          />
                          <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                              <span className="leading-none max-w-[10ch]">
                                {member.name}
                              </span>
                              <MemberRoleBadge role={member.role} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm max-w-[10ch] leading-none truncate text-muted-foreground">
                                {member.email}
                              </span>
                              {member.id !== user?.id && canManageWorkspace && (
                                <MemberActionsDropdown
                                  currentUserRole={user.role}
                                  user={member}
                                  organizationId={organizationId}
                                />
                              )}
                            </div>
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

function MemberActionsDropdown({
  user,
  organizationId,
  currentUserRole,
}: {
  user: MemberType;
  organizationId: string;
  currentUserRole: MembershipRole;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-fit ml-auto px-1" variant="outline" size="sm">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {currentUserRole !== "member" && (
          <UpdateMemberRoleDialog
            userId={user.id}
            currentRole={user.role}
            organizationId={organizationId}
            memberName={user.name}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Update Role
            </DropdownMenuItem>
          </UpdateMemberRoleDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
