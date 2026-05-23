"use client";

import { ThemeToggle } from "@/components/general/theme-toggle";
import UserAvatarDropdown from "@/components/general/user-avatar-dropdown";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { orpc } from "@/lib/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function WokrspaceHeader() {
  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background/40 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <code className="text-lg"># Cool channel</code>
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
