"use client";

import { formatLocalDateTime } from "@/lib/utils";
import Image from "next/image";
import Logo from "@/public/team-flow.png";
import { RenderJSONtoHTML } from "@/components/editor/render-content";
import { Edit2, MessagesSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { setThreadId } = useThread();
  const { setOpen } = useSidebarWithSide("right");

  /** Opens the right sidebar and loads this message's thread. */
  function openThread() {
    setThreadId(message.id);
    setOpen(true);
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
    <div className="flex relative group gap-3 items-start rounded-md hover:bg-muted/70 p-3 first:mt-4">
      <Image
        src={message.user.image || Logo}
        alt={message.user.name}
        width={40}
        height={40}
        className="size-8 rounded-full"
      />
      <div className="flex flex-col gap-2 *:leading-none w-full">
        <div className="flex gap-2 items-center">
          <p className="font-medium">{message.user.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatLocalDateTime(message.createdAt)}
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
              <MessagesSquare className="size-3.5" />
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
  const { setOpen } = useSidebarWithSide("right");

  return (
    <>
      <div className="absolute group-hover:flex hidden -top-4 right-8">
        <div className="flex gap-2 items-center">
          {canEdit && (
            <>
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit2 />
              </Button>

              {/* Destructive delete action — only shown to the message author */}
              <DeleteMessageDialog messageId={messageId}>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete message</span>
                </Button>
              </DeleteMessageDialog>
            </>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setThreadId(messageId);
              setOpen(true);
            }}
          >
            <MessagesSquare className="size-4" />
            <span className="sr-only">Open thread replies</span>
          </Button>
        </div>
      </div>
    </>
  );
}
