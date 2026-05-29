"use client";

import { ThemeToggle } from "@/components/general/theme-toggle";
import UserAvatarDropdown from "@/components/general/user-avatar-dropdown";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { orpc } from "@/lib/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { InviteWorkspaceDialog } from "../../_components/invite-workspace-dialog";

export function WokrspaceHeader() {
  const { channelId, workspaceId } = useParams<{
    channelId?: string;
    workspaceId: string;
  }>();
  const {
    data: { user, currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const {
    data: { channels },
  } = useSuspenseQuery(
    orpc.channel.list.queryOptions({ input: { organizationId: workspaceId } })
  );
  const activeChannel = channelId
    ? channels.find((channel) => channel.id === channelId)
    : undefined;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background/40 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <div className="flex items-center gap-2 text-lg font-mono">
        <span>#</span>
        <span className="truncate max-w-[10ch]">
          {activeChannel?.name ?? "Cool channel"}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="hidden sm:flex">
          <InviteWorkspaceDialog
            workspaceId={workspaceId}
            workspaceName={currentWorkspace?.name}
            channels={channels}
            channelId={channelId}
          >
            <Button>Invite</Button>
          </InviteWorkspaceDialog>
        </div>

        <ThemeToggle />
        <UserAvatarDropdown
          email={user.email}
          image={user.image}
          name={user.name}
        />
      </div>
    </header>
  );
}
