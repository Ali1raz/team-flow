/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { createMessageSchema, CreateMessageType } from "../../schema";
import { Messagecomponser } from "./message-omposer";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { client } from "@/lib/orpc";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types inferred directly from the oRPC client so they stay in sync with the
// server schema without any manual duplication.
// ---------------------------------------------------------------------------

/** Shape of a single page returned by the message.list procedure. */
type MessagePage = Awaited<ReturnType<typeof client.message.list>>;

/** Shape of a single message item inside a page. */
type MessageItem = MessagePage["messages"][number];

interface IAppPops {
  channelId: string;
}

export function MessageInput({ channelId }: IAppPops) {
  const [editorKey, setEditorKey] = useState(0);

  const form = useForm<CreateMessageType>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      imageUrl: undefined,
    },
    mode: "onChange",
  });

  const imageUrl = form.watch("imageUrl");

  const queryclient = useQueryClient();

  // Use workspace.list (already prefetched in the layout) instead of channel.get
  // to avoid a duplicate network request just for the current user's info.
  const {
    data: { user: currentUser },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (variables) => {
        // Stop any outgoing refetches so they don't overwrite the optimistic update.
        await queryclient.cancelQueries({
          queryKey: ["message.list", channelId],
        });

        // Snapshot the current cache so we can roll back on error.
        const prevData = queryclient.getQueryData<
          InfiniteData<MessagePage, string | undefined>
        >(["message.list", channelId]);

        // Build a fake message that matches MessageItem exactly so the UI
        // renders it immediately without waiting for the server round-trip.
        const tempId = `optimistic-${crypto.randomUUID()}`;
        const optimisticMessage: MessageItem = {
          id: tempId,
          content: variables.content,
          imageUrl: variables.imageUrl ?? null,
          createdAt: new Date(),
          // New messages have no replies yet; required by MessageItem's _count shape.
          _count: { replies: 0 },
          // Use the real session user so the avatar / name look correct.
          user: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            image:
              currentUser.image ??
              `https://avatar.vercel.sh/${currentUser.name ?? "U"}`,
          },
        };

        // Inject the optimistic message at the front of the first page.
        // The raw cache stores pages newest-first (orderBy: createdAt DESC),
        // so index-0 is the most-recent page — exactly where the new message belongs.
        if (prevData) {
          queryclient.setQueryData<
            InfiniteData<MessagePage, string | undefined>
          >(["message.list", channelId], {
            ...prevData,
            pages: [
              {
                ...prevData.pages[0],
                messages: [
                  optimisticMessage,
                  ...(prevData.pages[0]?.messages ?? []),
                ],
              },
              ...prevData.pages.slice(1),
            ],
          });
        }

        // Return snapshot so onError can restore it.
        return { prevData };
      },
      onSuccess: () => {
        toast.success("Message sent successfully");
        form.reset({ channelId, content: "", imageUrl: undefined });
        form.setValue("imageUrl", undefined);
        setEditorKey((prev) => prev + 1);
        queryclient.invalidateQueries({
          queryKey: orpc.message.list.key({
            type: "infinite",
            input: { channelId },
          }),
        });
      },
      onError: (error, _variables, context) => {
        // Roll back to the pre-optimistic snapshot if we have one.
        if (context?.prevData) {
          queryclient.setQueryData(
            ["message.list", channelId],
            context.prevData
          );
        }
        toast.error("Something bad happened, please try again!", {
          description: error instanceof Error ? error.message : null,
        });
      },
    })
  );

  function onSubmit(values: CreateMessageType) {
    createMessageMutation.mutate({
      ...values,
      imageUrl: imageUrl ?? undefined,
    });
  }

  return (
    <form id="message-form">
      <FieldGroup>
        <Controller
          control={form.control}
          name="content"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Messagecomponser
                key={editorKey}
                field={field}
                imageUrl={imageUrl}
                onImageChange={(url) => form.setValue("imageUrl", url)}
                onSubmit={form.handleSubmit(onSubmit)}
                isSubmitting={createMessageMutation.isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
