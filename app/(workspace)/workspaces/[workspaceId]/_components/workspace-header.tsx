"use client";

import { ThemeToggle } from "@/components/general/theme-toggle";
import UserAvatarDropdown from "@/components/general/user-avatar-dropdown";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { orpc } from "@/lib/orpc";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function WokrspaceHeader() {
  const { channelId } = useParams<{ channelId: string }>();
  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const { data, isLoading } = useQuery({
    // Only fetch when we actually have a channelId (header is rendered on all
    // workspace pages, not just channel pages). Without this guard the query
    // fires with an undefined channelId on non-channel routes.
    ...orpc.channel.get.queryOptions({
      input: {
        channelId,
      },
    }),
    enabled: !!channelId,
    // Channel metadata rarely changes; treat it as fresh for 5 minutes so
    // navigating back and forth doesn't trigger unnecessary refetches.
    staleTime: 5 * 60 * 1000,
  });

  console.log(data?.channel);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background/40 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <code className="text-lg">
        # {isLoading ? "Loading..." : (data?.channel ?? "Cool channel")}
      </code>
      <div className="ml-auto flex items-center gap-4">
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
