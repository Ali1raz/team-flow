"use client";

import { cn, formatRelativeTime } from "@/lib/utils";
import Image from "next/image";
import Logo from "@/public/team-flow.png";
import { RenderJSONtoHTML } from "@/components/editor/render-content";
import { Edit2, MessagesSquare, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditMessageForm } from "./edit-message-form";
import { useCallback, useState } from "react";
import { DeleteMessageDialog } from "./delete-message-dialog";
import { client, orpc } from "@/lib/orpc";
import { useSidebarWithSide } from "@/components/ui/sidebar";
import { useThread } from "@/components/thread-sidebar/thread-context";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";

export type messageType = Awaited<
  ReturnType<typeof client.message.list>
>["messages"][number];

export type MessagePage = {
  messages: messageType[];
  nextCursor: string | null;
};
export type InfiniteMessages = InfiniteData<MessagePage>;

export function MessageItem({
  message,
  currentUserId,
}: {
  message: messageType;
  currentUserId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Access thread context and right sidebar so the replies button can open the
  // thread panel in the same way the MessagesSquare action button does.
  const { setThreadId, threadId } = useThread();
  const { setOpen, isMobile, setOpenMobile, open } =
    useSidebarWithSide("right");

  /** Opens the right sidebar and loads this message's thread. */
  function openThread() {
    setThreadId(message.id);
    if (isMobile) {
      setOpenMobile(true);
    } else {
      setOpen(true);
    }
  }

  const queryClinet = useQueryClient();

  const prefetchThread = useCallback(() => {
    const options = orpc.message.threads.list.queryOptions({
      input: { threadId: message.id },
    });
    queryClinet
      .prefetchQuery({ ...options, staleTime: 60_000 })
      .catch(() => {});
  }, [queryClinet, message.id]);

  return (
    <div
      className={cn(
        "flex relative group gap-3 items-start rounded-md overflow-x-hidden hover:bg-muted/70 p-3 first:mt-4",
        open && message.id === threadId && "bg-muted/50 ring-1"
      )}
    >
      <Image
        src={message.user.image || Logo}
        alt={message.user.name}
        width={40}
        height={40}
        className="size-8 rounded-full"
      />
      <div className="flex flex-col gap-2 *:leading-none w-full">
        <div className="flex gap-2 items-center">
          <p className="font-medium line-clamp-1">{message.user.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {formatRelativeTime(message.createdAt)}
          </p>
        </div>
        {isEditing ? (
          <EditMessageForm
            message={message}
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <>
            <RenderJSONtoHTML
              content={JSON.parse(message.content)}
              className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
            />

            {message.imageUrl && (
              <div>
                <Image
                  src={message.imageUrl}
                  alt="uploaded image"
                  width={512}
                  height={512}
                  className="object-cover rounded max-h-75 w-auto"
                />
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={openThread}
              className="flex items-center gap-1"
              onMouseEnter={prefetchThread}
              onFocus={prefetchThread}
            >
              <MessagesSquare className="size-4" />
              {message._count.replies || 0}{" "}
              {message._count.replies <= 1 ? "reply" : "replies"}
            </Button>
          </>
        )}
      </div>

      <MessageActions
        messageId={message.id}
        onEdit={() => setIsEditing(true)}
        canEdit={message.user.id === currentUserId}
      />
    </div>
  );
}

function MessageActions({
  messageId,
  onEdit,
  canEdit,
}: {
  messageId: string;
  onEdit: () => void;
  canEdit: boolean;
}) {
  const { setThreadId } = useThread();
  const { setOpen, isMobile, setOpenMobile } = useSidebarWithSide("right");
  const [dropdownopen, setDropdownOpen] = useState(false);

  return (
    <DropdownMenu open={dropdownopen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm">
          <MoreVertical />
          <span className="sr-only">Message actions</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            setThreadId(messageId);
            if (isMobile) {
              setOpenMobile(true);
            } else {
              setOpen(true);
            }
            setDropdownOpen(false);
          }}
        >
          <MessagesSquare />
          Open thread
        </DropdownMenuItem>

        {canEdit && (
          <>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onEdit();
                setDropdownOpen(false);
              }}
            >
              <Edit2 />
              Edit
            </DropdownMenuItem>

            <DeleteMessageDialog messageId={messageId}>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                }}
                variant="destructive"
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DeleteMessageDialog>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
