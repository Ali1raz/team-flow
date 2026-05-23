"use client";
import * as React from "react";

import { CreateTeamDialog } from "@/components/create-tem-dialog";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
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
import { ChevronRight, Hash } from "lucide-react";
import { UserImage } from "./general/user-avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";

export function AppSidebar({
  organizationId,
  ...props
}: React.ComponentProps<typeof Sidebar> & { organizationId: string }) {
  const {
    data: { members, channels, activeTeamId },
  } = useSuspenseQuery(
    orpc.channel.list.queryOptions({ input: { organizationId } })
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader className="space-y-4">
        <WorkspaceSwitcher />
        <CreateTeamDialog />
      </SidebarHeader>
      <SidebarContent className="flex flex-col overflow-hidden h-full">
        {/* Channels */}
        <SidebarGroup className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <SidebarMenu className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Collapsible
              defaultOpen
              className="group/collapsible flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              <SidebarMenuItem className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    Channels
                    <ChevronRight className="ml-auto transition-transform duration-100 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {/* Keep flex sizing on a stable wrapper so Radix's internal content div cannot break scroll height propagation. */}
                <div className="flex-1 min-h-0">
                  <CollapsibleContent className="h-full overflow-hidden">
                    <ScrollArea className="h-full">
                      <SidebarMenuSub>
                        {channels &&
                          channels.map((ch) => (
                            <SidebarMenuSubItem key={ch.id}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  activeTeamId === ch.id &&
                                    "bg-accent text-accent-foreground"
                                )}
                              >
                                <Link
                                  href={`/workspaces/${organizationId}/channel/${ch.id}`}
                                  className="flex items-center gap-2 truncate"
                                >
                                  <Hash className="size-4" /> {ch.name}
                                </Link>
                              </SidebarMenuSubButton>
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
                          className="flex items-center gap-3 py-1 rounded-md hover:bg-accent truncate"
                        >
                          <UserImage
                            name={user.name}
                            image={user.image}
                            className="size-8 object-cover"
                          />
                          <div className="flex flex-col flex-1 gap-1">
                            <span className="leading-none">{user.name}</span>
                            <span className="text-sm leading-none text-muted-foreground">
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
