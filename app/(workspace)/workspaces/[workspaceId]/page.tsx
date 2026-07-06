import type { Metadata } from "next";
import { client } from "@/lib/orpc";
import { ChannelList } from "./_components/channel-list";

export async function generateMetadata(
  props: PageProps<"/workspaces/[workspaceId]">
): Promise<Metadata> {
  const { params } = props;
  const { workspaceId } = await params;
  const { workspaces } = await client.workspace.list();
  const workspace = workspaces.find((w) => w.id === workspaceId);

  return {
    title: workspace?.name ?? "Workspace",
  };
}

export default async function Page(
  props: PageProps<"/workspaces/[workspaceId]">
) {
  const { params } = props;
  const { workspaceId } = await params;

  return <ChannelList workspaceId={workspaceId} />;
}
