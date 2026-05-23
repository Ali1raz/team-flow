"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageItem } from "./message-item";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";

export function MessageList() {
  const { channelId } = useParams<{ channelId: string }>();

  const { data: messages } = useQuery(
    orpc.message.list.queryOptions({ input: { channelId } })
  );

  return (
    <main className="h-full relative">
      <div className="h-full overflow-y-auto">
        {messages?.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
      </div>
    </main>
  );
}
