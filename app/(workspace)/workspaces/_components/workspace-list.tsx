"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, getWorkspaceColor } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { orpc } from "@/lib/orpc";

export function WorkspaceList() {
  const {
    data: { workspaces, currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

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
              <Image alt={org.name} src={org.logo} width={50} height={50} />
            ) : (
              <div
                className={cn(
                  "size-12 rounded-full transition-all duration-100",
                  getWorkspaceColor(org.id)
                )}
              ></div>
            )}
            <CardTitle>
              <h2 className="text-xl font-bold">
                <Link
                  className="group-hover:text-primary hover:underline underline-offset-4"
                  href={`/workspaces/${org.slug}`}
                >
                  {org.name}
                </Link>
              </h2>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
