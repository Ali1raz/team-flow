"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { MessageItem } from "./message-item";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { ChevronLeftCircle, ChevronsDownIcon, FolderCode } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function MessageList() {
  const { channelId } = useParams<{ channelId: string }>();
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [newMessages, setNewMessages] = useState<boolean>(false);
  const lastItemRef = useRef<string | undefined>(undefined);

  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageParams: string | undefined) => ({
      channelId,
      cursor: pageParams,
      limit: 30,
    }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: [...data.pages]
        .map((i) => ({
          ...i,
          messages: [...i.messages].reverse(),
        }))
        .reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    isFetching,
  } = useInfiniteQuery({
    ...infiniteOptions,
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const isNearBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

  const handleScroll = () => {
    const el = ref.current;

    if (!el) return;

    if (el.scrollTop <= 80 && hasNextPage && !isFetching) {
      const prevScrollHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;
      fetchNextPage().then(() => {
        console.log("===\nfetched next page", {
          hasNextPage,
          isFetchingNextPage,
        });
        // After loading new messages, adjust scroll to maintain position
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
      });
    }
    setIsAtBottom(isNearBottom(el));
  };

  const messages = useMemo(() => {
    return data?.pages.flatMap((page) => page.messages) ?? [];
  }, [data]);

  useEffect(() => {
    if (messages.length && !hasInitialScrolled) {
      const el = ref.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
        setHasInitialScrolled(true);
        setIsAtBottom(true);
      }
    }
  }, [messages.length, hasInitialScrolled]);

  useEffect(() => {
    if (!messages.length) return;
    const lastId = messages[messages.length - 1].id;
    const prevItemId = lastItemRef.current;

    const el = ref.current;
    if (prevItemId && lastId !== prevItemId) {
      if (el && isNearBottom(el)) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });

        setNewMessages(false);
        setIsAtBottom(true);
      } else {
        setNewMessages(true);
      }
    }
    lastItemRef.current = lastId;
  }, [messages]);

  const scrollToBottom = () => {
    const el = ref.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
      setNewMessages(false);
      setIsAtBottom(true);
    }
  };

  if ((!messages || messages?.length === 0) && !isFetching) {
    return (
      <Empty className="h-full bg-muted/40 my-4">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-muted rounded-full size-28">
            <FolderCode className="size-14" />
          </EmptyMedia>
          <EmptyTitle className="sm:text-4xl sm:mt-8 mt-4 text-2xl">
            No messages
          </EmptyTitle>
          <EmptyDescription className="w-xl sm:text-lg text-xs">
            There are no messages in this channel yet. Start the conversation by
            sending a message!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={ref} onScroll={handleScroll} className="h-full overflow-y-auto">
        {messages?.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {newMessages && !isAtBottom && (
        <Button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 rounded-full shadow-md"
        >
          <ChevronsDownIcon className="size-4" /> New messages
        </Button>
      )}
    </div>
  );
}
