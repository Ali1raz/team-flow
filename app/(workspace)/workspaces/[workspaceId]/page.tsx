import { client } from "@/lib/orpc";
import { redirect } from "next/navigation";
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

export default async function Page(
  props: PageProps<"/workspaces/[workspaceId]">
) {
  const { params } = props;
  const { workspaceId } = await params;
  const { channels } = await client.channel.list({
    organizationId: workspaceId,
  });

  // Just redirect — don't mutate session here
  if (channels.length > 0) {
    redirect(`/workspaces/${workspaceId}/channel/${channels[0].id}`);
  }

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
          No channel found in this workspace, once created channels will appear
          here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateTeamDialog />
      </EmptyContent>
    </Empty>
  );
}
