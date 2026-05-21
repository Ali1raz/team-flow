import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cn, getWorkspaceColor } from "@/lib/utils";
import { requireSession } from "@/app/data/session/require-session";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "./_components/header";
import { CreateWorkspaceDialog } from "./_components/create-workspace-dialog";

export default async function Workspaces() {
  const [data, { session }] = await Promise.all([
    auth.api.listOrganizations({
      // This endpoint requires session cookies.
      headers: await headers(),
    }),
    requireSession(),
  ]);

  console.log("Fetched organizations:", data.length);

  return (
    <div className="h-screen bg-muted/20 w-full">
      <WorkspaceHeader />
      <div className="max-w-6xl mx-auto px-4 py-8 mt-6 pt-16 space-y-4">
        <div className="flex sm:justify-between max-sm:items-start items-center sm:flex-row flex-col gap-3">
          <h1 className="text-2xl md:text-4xl font-bold">Workspaces</h1>
          <CreateWorkspaceDialog />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 my-4">
          {data?.map((org) => (
            <Card
              key={org.slug}
              className={cn(
                "group border-transparent border-2 hover:border-primary/35 cursor-pointer transition-colors duration-100",
                org.id === session.activeOrganizationId &&
                  "border-primary rounded-3xl relative"
              )}
            >
              {org.id === session.activeOrganizationId && (
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
      </div>
    </div>
  );
}
