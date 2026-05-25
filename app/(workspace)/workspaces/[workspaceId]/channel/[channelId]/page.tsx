import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { MessageInput } from "../../_components/messaeg-input";
import { MessageList } from "../../_components/MessageList";
import { orpc } from "@/lib/orpc";

export default async function ChannelIdPAge(
  props: PageProps<"/workspaces/[workspaceId]/channel/[channelId]">
) {
  const { params } = props;
  const { channelId } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    orpc.channel.get.queryOptions({ input: { channelId } })
  );

  return (
    <HydrateClient client={queryClient}>
      <section className="h-full flex w-full flex-col">
        <div className="flex-1 mb-4 px-2 min-h-0">
          <MessageList />
        </div>

        <div className="sticky bottom-0 shrink-0 bg-background p-2 pb-3 pt-0">
          <MessageInput channelId={channelId} />
        </div>
      </section>
    </HydrateClient>
  );
}
