"use client";
import { RealtimechannelEventSchema, RealtimechannelEventSchemaType, RealtimeMessageSchemaType } from "@/realtime/schema";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import usePartySocket from "partysocket/react";
import { createContext, ReactNode, useContext, useMemo } from "react";

interface RealtimeChannelContextProps {
  channelId: string;
  children: ReactNode;
}

type MessageListPage = { messages: RealtimeMessageSchemaType[], nextCursor?: string }
type InfiniteMessages = InfiniteData<MessageListPage>

type RealtimeChannelContextValue = {
  send: (e: RealtimechannelEventSchemaType) => void;
}

const RealtimeChannelContext = createContext<RealtimeChannelContextValue | null>(null);

export const RealtimeChannelProvider = ({
  channelId,
  children
}: RealtimeChannelContextProps) => {
  const queryClient = useQueryClient();

  const socket = usePartySocket({
    host: "http://localhost:8787",
    room: channelId,
    party: "chat",
    onMessage(event) {
      try {
        const data = JSON.parse(event.data);
        const res = RealtimechannelEventSchema.safeParse(data);
        if (res.error) {
          console.log("Failed to parse message:", res.error);
          return;
        }
        const eventData = res.data;

        if (eventData.type === "message:created") {
          const raw = eventData.payload.message;
          const mapped = {
            ...raw,
            _count: { replies: raw.repliesCount ?? 0 },
          };

          queryClient.setQueryData<InfiniteMessages>(
            ["message.list", channelId],
            (oldMessages) => {
              if (!oldMessages) return {
                pageParams: [undefined],
                pages: [{ messages: [mapped], nextCursor: undefined }]
              } as InfiniteMessages;

              const first = oldMessages.pages[0];
              const updatedFirst = {
                ...first,
                messages: [mapped, ...first.messages]
              };
              return {
                ...oldMessages,
                pages: [updatedFirst, ...oldMessages.pages.slice(1)]
              };
            }
          );
        }

        if (eventData.type === "message:updated") {
          const updated = eventData.payload.message;
          // replace message in infinite list
          queryClient.setQueryData<InfiniteMessages>(["message.list", channelId], (old) => {
            if (!old) return old;
            const pages = old.pages.map(page => ({
              ...page,
              messages: page.messages.map(message => message.id === updated.id ? { ...message, ...updated } : message)
            }));
            return { ...old, pages }
          });
          return;
        }

        if (eventData.type === "message:reply:increment") {
          const { messageId, delta } = eventData.payload

          queryClient.setQueryData<InfiniteMessages>(['message.list', channelId], (old) => {
            if (!old) return old;
            const pages = old.pages.map(page => ({
              ...page,
              messages: page.messages.map(message => message.id === messageId ? {
                ...message, _count: {replies: Math.max(0, Number(message._count?.replies ?? 0) + Number(delta))},
              } : message)
            }));

            return { ...old, pages }
          });
          return;
        }

      } catch {
        console.log("[RealtimeChannelProvider]: Something went wrong");
      }
    },
  });

  const value = useMemo<RealtimeChannelContextValue>(() => ({
    send: (e) => socket.send(JSON.stringify(e))
  }), [socket]);

  return (
    <RealtimeChannelContext.Provider value={value}>
      {children}
    </RealtimeChannelContext.Provider>
  );
};

export function useRealtimeChannel(): RealtimeChannelContextValue {
  const ctx = useContext(RealtimeChannelContext);
  if (!ctx) throw new Error("useRealtimeChannel must be used within RealtimeChannelProvider");
  return ctx;
}
