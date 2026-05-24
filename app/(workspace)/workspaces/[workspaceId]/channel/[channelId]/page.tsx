import { MessageInput } from "../../_components/messaeg-input";
import { MessageList } from "../../_components/MessageList";

export default async function ChannelIdPAge(
  props: PageProps<"/workspaces/[workspaceId]/channel/[channelId]">
) {
  const { params } = props;
  const { channelId } = await params;
  return (
    <section className="h-full flex w-full flex-col">
      <div className="flex-1 mb-4 px-2 min-h-0">
        <MessageList />
      </div>

      <div className="sticky bottom-0 shrink-0 bg-background p-2 pb-3 pt-0">
        <MessageInput channelId={channelId} />
      </div>
    </section>
  );
}
