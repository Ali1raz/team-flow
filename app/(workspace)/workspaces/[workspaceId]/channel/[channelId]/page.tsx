import { MessageInput } from "../../_components/messaeg-input";
import { MessageList } from "../../_components/MessageList";

export default async function ChannelIdPAge(
  props: PageProps<"/workspaces/[workspaceId]/channel/[channelId]">
) {
  const { params } = props;
  const { channelId } = await params;
  return (
    <section className="h-screen flex w-full">
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-hidden mb-4">
          <MessageList />
        </div>

        <div className="border-t bg-background p-4">
          <MessageInput channelId={channelId} />
        </div>
      </div>
    </section>
  );
}
