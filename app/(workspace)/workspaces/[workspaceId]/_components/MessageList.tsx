"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { MessageItem } from "./message-item";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import {
  Ban,
  ChevronDownIcon,
  ChevronLeftCircle,
  ChevronsDownIcon,
  Divide,
  FolderCode,
} from "lucide-react";
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
    queryKey: ["message.list", channelId],
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
    const atBottom = isNearBottom(el);
    setIsAtBottom(atBottom);
    // Clear the new-messages flag as soon as the user reaches the bottom,
    // so the button doesn't ghost-reappear on the next scroll tick.
    if (atBottom) setNewMessages(false);
  };

  const messages = useMemo(() => {
    return data?.pages.flatMap((page) => page.messages) ?? [];
  }, [data]);

  useEffect(() => {
    if (messages.length && !hasInitialScrolled) {
      const el = ref.current;
      if (el) {
        bottomRef.current?.scrollIntoView({ block: "end" });
        setHasInitialScrolled(true);
        setIsAtBottom(true);
      }
    }
  }, [messages.length, hasInitialScrolled]);

  // keep view pinned to bottom on late content load (images):
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scrolltoBottomIfNeeded = () => {
      if (isAtBottom || !hasInitialScrolled) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ block: "end" });
        });
      }
    };

    const onImageLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        scrolltoBottomIfNeeded();
      }
    };

    el.addEventListener("load", onImageLoad, true);

    const resizeObserver = new ResizeObserver(() => {
      scrolltoBottomIfNeeded();
    });
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(() => {
      scrolltoBottomIfNeeded();
    });
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      mutationObserver.disconnect();
      el.removeEventListener("load", onImageLoad, true);
      resizeObserver.disconnect();
    };
  }, [isAtBottom, hasInitialScrolled]);

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
      bottomRef.current?.scrollIntoView({ block: "end" });
      setNewMessages(false);
      setIsAtBottom(true);
    }
  };

  if ((!messages || messages?.length === 0) && !isFetching) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Empty className="h-full bg-muted/40">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-muted rounded-full size-28"
            >
              <Ban className="sm:size-14 size-8" />
            </EmptyMedia>
            <EmptyTitle className="sm:text-4xl sm:mt-6 mt-4 text-2xl">
              No messages
            </EmptyTitle>
            <EmptyDescription className="w-xl sm:text-lg text-xs">
              There are no messages in this channel yet. Start the conversation
              by sending a new message!
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
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

      <div className="flex gap-2 absolute bottom-4 right-4 z-20">
        {!isAtBottom && (
          <Button
            type="button"
            size="sm"
            className="size-8 rounded-full hover:shadow-xl transition-all duration-100"
            onClick={scrollToBottom}
          >
            <ChevronDownIcon className="size-4" />
          </Button>
        )}

        {newMessages && !isAtBottom && (
          <Button
            type="button"
            onClick={scrollToBottom}
            className="rounded-full shadow-md"
          >
            <ChevronsDownIcon className="size-4" /> New messages
          </Button>
        )}
      </div>
    </div>
  );
}
