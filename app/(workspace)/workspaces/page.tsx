import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import defaultLogo from "@/public/team-flow.png";
import Link from "next/link";
import { CreateWorkspaceDialog } from "./_components/create-workspace-dialog";
import { authClient } from "@/lib/auth-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const orgs = [
  {
    name: "TeamFlow",
    slug: "teamflow",
    logo: "/team-flow.png",
  },
  {
    name: "Acme Corp",
    slug: "acme-corp",
  },
];

export default async function Workspaces() {
  const data = await auth.api.listOrganizations({
    // This endpoint requires session cookies.
    headers: await headers(),
  });

  console.log("Fetched organizations:", data.length);

  return (
    <div className="h-screen bg-muted/20 w-full">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-16 space-y-4">
        <div className="flex sm:justify-between max-sm:items-start items-center sm:flex-row flex-col gap-3">
          <h1 className="text-2xl md:text-4xl font-bold">Workspaces</h1>
          <CreateWorkspaceDialog />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 my-4">
          {data?.map((org) => (
            <Card
              key={org.slug}
              className="group border-transparent border-2 hover:border-primary/35 cursor-pointer transition-colors duration-100"
            >
              <CardHeader className="space-y-2">
                <Image
                  alt={org.name}
                  src={org.logo || defaultLogo}
                  width={50}
                  height={50}
                />
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
