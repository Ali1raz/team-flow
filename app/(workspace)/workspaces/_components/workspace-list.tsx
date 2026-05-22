"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, getWorkspaceColor } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { orpc } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function WorkspaceList() {
  const {
    data: { workspaces, currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const router = useRouter();

  async function handleSwitch(orgId: string) {
    const { error } = await authClient.organization.setActive({
      organizationId: orgId,
    });

    if (error) {
      toast.error("Failed to switch workspace", {
        description: error.message ?? "Unknown error",
      });
      return;
    }
    toast.success("Switched workspace successfully");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 my-4">
      {workspaces?.map((org) => (
        <Card
          key={org.slug}
          className={cn(
            "group border-transparent border-2 hover:border-primary/35 cursor-pointer transition-colors duration-100",
            org.id === currentWorkspace?.id &&
              "border-primary rounded-3xl relative"
          )}
        >
          {org.id === currentWorkspace?.id && (
            <Badge className="absolute right-2 top-2">Active</Badge>
          )}
          <CardHeader className="space-y-2">
            {org.logo ? (
              <div className="size-12 overflow-hidden rounded-full">
                <Image
                  alt={org.name}
                  src={org.logo}
                  width={50}
                  height={50}
                  unoptimized
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "size-12 rounded-full transition-all duration-100",
                  getWorkspaceColor(org.id)
                )}
              />
            )}
            <CardTitle>
              <h2 className="text-xl font-bold">
                <Link
                  className="group-hover:text-primary hover:underline underline-offset-4"
                  href={`/workspaces/${org.id}`}
                >
                  {org.name}
                </Link>
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <CardAction className="absolute bottom-0 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Workspace options</DropdownMenuLabel>
                    {org.id !== currentWorkspace?.id && (
                      <DropdownMenuItem onClick={() => handleSwitch(org.id)}>
                        Switch to this Workspace
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
