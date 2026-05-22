"use client";

import Image from "next/image";
import Logo from "@/public/team-flow.png";
import { ThemeToggle } from "@/components/general/theme-toggle";
import UserAvatarDropdown from "@/components/general/user-avatar-dropdown";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

export function WorkspaceHeader() {
  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  return (
    <header className="w-full fixed top-0 left-0 px-4 py-4 bg-muted/50 backdrop-blur-sm border-b z-50">
      <div className="flex items-center max-w-6xl mx-auto justify-between">
        <div className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" width={40} height={40} /> TeamFlow
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserAvatarDropdown
            email={user.email}
            image={user.image}
            name={user.name}
          />
        </div>
      </div>
    </header>
  );
}
