"use client";

import { formatLocalDateTime } from "@/lib/utils";
import Image from "next/image";
import Logo from "@/public/team-flow.png";
import { RenderJSONtoHTML } from "@/components/editor/render-content";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditMessageForm } from "./edit-message-form";
import { useState } from "react";
import { client } from "@/lib/orpc";

export type messageType = Awaited<
  ReturnType<typeof client.message.list>
>["messages"][number];

export function MessageItem({
  message,
  currentUserId,
}: {
  message: messageType;
  currentUserId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex relative group gap-3 items-start rounded-md hover:bg-muted/70 p-3">
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
          </>
        )}
      </div>

      <MessageActions
        onEdit={() => setIsEditing(true)}
        canEdit={message.user.id === currentUserId}
      />
    </div>
  );
}
function MessageActions({
  onEdit,
  canEdit,
}: {
  onEdit: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="absolute group-hover:flex hidden -top-4 right-8">
      <div className="flex gap-2 items-center">
        {canEdit && (
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit2 />
          </Button>
        )}
      </div>
    </div>
  );
}
