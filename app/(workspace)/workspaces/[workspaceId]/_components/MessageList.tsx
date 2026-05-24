"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageItem } from "./message-item";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { FolderCode } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function MessageList() {
  const { channelId } = useParams<{ channelId: string }>();

  const { data: messages } = useQuery(
    orpc.message.list.queryOptions({ input: { channelId } })
  );

  if (!messages || messages?.length === 0) {
    return (
      <Empty className="h-full bg-muted/40 my-4">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-muted rounded-full size-28">
            <FolderCode className="size-14" />
          </EmptyMedia>
          <EmptyTitle className="sm:text-4xl sm:mt-8 mt-4 text-2xl">
            No messages
          </EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty sm:text-lg text-xs">
            There are no messages in this channel yet. Start the conversation by
            sending a message!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

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
