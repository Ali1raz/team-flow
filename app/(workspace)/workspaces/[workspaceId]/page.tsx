import { client } from "@/lib/orpc";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArrowRight, FolderCode } from "lucide-react";
import { CreateTeamDialog } from "@/components/create-tem-dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Page(
  props: PageProps<"/workspaces/[workspaceId]">
) {
  const { params } = props;
  const { workspaceId } = await params;
  const { channels } = await client.channel.list({
    organizationId: workspaceId,
  });

  if (channels.length === 0)
    return (
      <Empty className="h-full bg-muted/40">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-muted rounded-full size-28">
            <FolderCode className="size-14" />
          </EmptyMedia>
          <EmptyTitle className="sm:text-4xl text-2xl sm:mt-8 mt-4">
            No channel found!
          </EmptyTitle>
          <EmptyDescription className="text-pretty">
            No channel found in this workspace, once created channels will
            appear here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateTeamDialog />
        </EmptyContent>
      </Empty>
    );

  return (
    <div className="p-4 sm:p-6">
      <h1 className="font-bold text-2xl">Your channels</h1>

      <div className="max-w-xl mt-4 space-y-2">
        {channels.map((channel) => (
          <Card key={channel.id} className="group w-full outline-2 outline-transparent hover:outline-primary outline-offset-4 rounded-xl">
            <CardHeader>
              <CardTitle>
                <Link
                  href={`/workspaces/${workspaceId}/channel/${channel.id}`}
                  className="hover:underline"
                >
                  {channel.name}
                </Link>
              </CardTitle>
              <CardDescription>
                <Link
                  href={`/workspaces/${workspaceId}/channel/${channel.id}/members`}
                  className="hover:underline"
                >
                  Total members: {channel.totalMembers}
                </Link>
              </CardDescription>
            </CardHeader>

            <CardContent className="relative">
              <CardAction className="absolute bottom-0 right-4 opacity-0 group-hover:opacity-100 transition duration-75">
                <div className="size-8 bg-muted/40 rounded-full flex items-center justify-center">
                  <ArrowRight className="size-4" />
                </div>
              </CardAction>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
