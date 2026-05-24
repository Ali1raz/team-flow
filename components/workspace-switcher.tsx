"use client";

import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CreateWorkspaceDialog } from "@/app/(workspace)/workspaces/_components/create-workspace-dialog";
import { Button } from "./ui/button";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import Image from "next/image";
import { cn, createAvatarUrl } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { useState } from "react";

export function WorkspaceSwitcher() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: { workspaces, currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const [activeId, setActiveId] = useState<string | null>(
    currentWorkspace?.id ?? null
  );

  // Always derive from state so UI updates immediately
  const activeWorkspace =
    workspaces.find((w) => w.id === activeId) ?? currentWorkspace;

  const handleChange = async (id: string) => {
    if (id === activeId) return;

    const { data, error } = await authClient.organization.setActive({
      organizationId: id,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong");
      return;
    }

    setActiveId(data.id);
    toast.success("Switched workspace successfully, Redirecting...");
    await queryClient.invalidateQueries(orpc.workspace.list.queryOptions());
    router.push(`/workspaces/${data.id}`);
  };

  if (!activeWorkspace) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full px-4 mt-2">
              <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Image
                  alt="logo"
                  src={
                    activeWorkspace.logo ??
                    createAvatarUrl(activeWorkspace.name)
                  }
                  width={20}
                  height={20}
                  unoptimized
                />
              </div>
              <span className="truncate font-medium line-clamp-1">
                {activeWorkspace.name}
              </span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Your Workspaces
            </DropdownMenuLabel>

            {workspaces.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleChange(org.id)}
                className={cn(
                  "flex items-center gap-2 justify-between p-2",
                  org.id === activeId && "bg-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-xs border">
                    <Image
                      alt="logo"
                      src={org.logo || createAvatarUrl(org.name)}
                      width={20}
                      height={20}
                      unoptimized
                    />
                  </div>
                  {org.name}
                </div>
                {org.id === activeId && <Badge>Active</Badge>}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="my-4" asChild>
              <CreateWorkspaceDialog>
                <Button onClick={(e) => e.stopPropagation()} className="w-full">
                  Create Workspace
                </Button>
              </CreateWorkspaceDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
