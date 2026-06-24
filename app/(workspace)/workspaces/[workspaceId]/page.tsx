import { client } from "@/lib/orpc";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FolderCode } from "lucide-react";
import { CreateTeamDialog } from "@/components/create-tem-dialog";
import { ChannelCard } from "./_components/channel-card";

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
    <div className="p-4 sm:p-6 sm:max-w-xl w-full">
      <h1 className="font-bold text-2xl">Your channels</h1>

      <div className="mt-4 space-y-2">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            workspaceId={workspaceId}
          />
        ))}
      </div>
    </div>
  );
}
