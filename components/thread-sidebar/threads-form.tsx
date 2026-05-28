/* eslint-disable react-hooks/incompatible-library */
"use client";

import {
  createMessageSchema,
  CreateMessageType,
} from "@/app/(workspace)/workspaces/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup } from "../ui/field";
import { Messagecomponser } from "@/app/(workspace)/workspaces/[workspaceId]/_components/message-omposer";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { client, orpc } from "@/lib/orpc";
import { toast } from "sonner";

type ThreadsData = Awaited<ReturnType<typeof client.message.threads.list>>;
type ThreadItem = ThreadsData["threads"][number];

// Shape of one page in the message list infinite cache (mirrors MessageList.tsx).
type MessagePage = Awaited<ReturnType<typeof client.message.list>>;
type InfiniteMessageList = InfiniteData<MessagePage>;

export function ThreadsForm({ threadId }: { threadId: string }) {
  const [editorKey, setEditorKey] = useState(0);
  const { channelId } = useParams<{ channelId: string }>();

  const form = useForm<CreateMessageType>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId,
      imageUrl: undefined,
      threadId,
    },
    mode: "onChange",
  });

  const queryClient = useQueryClient();

  // Single source of truth for the query key used across cancel, snapshot,
  // setQueryData, and invalidate — they must all reference the same key.
  const threadsQueryOptions = orpc.message.threads.list.queryOptions({
    input: { threadId },
  });

  // Raw key under which MessageList.tsx stores its infinite data.
  // Must match the `queryKey` option in MessageList's infiniteOptions call.
  const messageListKey = ["message.list", channelId];

  const {
    data: { user: currentUser },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const createThreadMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (variables) => {
        // Stop any outgoing refetches so they don't overwrite the optimistic entry.
        await queryClient.cancelQueries({
          queryKey: threadsQueryOptions.queryKey,
        });
        // Also cancel message list fetches so our reply-count increment isn't overwritten.
        await queryClient.cancelQueries({ queryKey: messageListKey });

        // Snapshot the thread cache so we can roll back on error.
        const prevData = queryClient.getQueryData<ThreadsData>(
          threadsQueryOptions.queryKey
        );
        // Snapshot the message list so we can roll back the reply count on error.
        const prevMessageListData =
          queryClient.getQueryData<InfiniteMessageList>(messageListKey);

        // Build a temporary reply that matches ThreadItem exactly so it renders
        // immediately without waiting for the server round-trip.
        const optimisticThread: ThreadItem = {
          id: `optimistic-${crypto.randomUUID()}`,
          content: variables.content,
          imageUrl: variables.imageUrl ?? null,
          createdAt: new Date(),
          // Use the real session user so the avatar and name look correct.
          user: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            image:
              currentUser.image ??
              `https://avatar.vercel.sh/${currentUser.name ?? "U"}`,
          },
        };

        // Append the optimistic reply at the end — server orders threads by
        // createdAt ASC so newest always goes last.
        if (prevData) {
          queryClient.setQueryData<ThreadsData>(threadsQueryOptions.queryKey, {
            ...prevData,
            threads: [...prevData.threads, optimisticThread],
          });
        }

        // Optimistically increment the reply count on the parent message so the
        // message list shows the updated count immediately without a refetch.
        if (prevMessageListData) {
          queryClient.setQueryData<InfiniteMessageList>(messageListKey, {
            ...prevMessageListData,
            pages: prevMessageListData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) =>
                msg.id === threadId
                  ? {
                      ...msg,
                      _count: {
                        ...msg._count,
                        replies: msg._count.replies + 1,
                      },
                    }
                  : msg
              ),
            })),
          });
        }

        // Return both snapshots so onError can restore them.
        return { prevData, prevMessageListData };
      },
      onSuccess: () => {
        toast.success("Reply sent successfully");
        form.reset({ channelId, content: "", imageUrl: undefined, threadId });
        form.setValue("imageUrl", undefined);
        setEditorKey((prev) => prev + 1);
        // Replace the optimistic thread entry with real server data.
        queryClient.invalidateQueries({
          queryKey: threadsQueryOptions.queryKey,
        });
        // Invalidate the message list using the raw key that MessageList.tsx
        // actually stores data under. The oRPC-generated key is different and
        // would silently miss the cache entry, leaving the reply count stale.
        queryClient.invalidateQueries({ queryKey: messageListKey });
      },
      onError: (error, _variables, context) => {
        // Roll back the thread list to its pre-optimistic snapshot.
        if (context?.prevData) {
          queryClient.setQueryData(
            threadsQueryOptions.queryKey,
            context.prevData
          );
        }
        // Roll back the optimistic reply count increment in the message list.
        if (context?.prevMessageListData) {
          queryClient.setQueryData(messageListKey, context.prevMessageListData);
        }
        toast.error("Something bad happened, please try again!", {
          description: error instanceof Error ? error.message : null,
        });
      },
    })
  );

  const imageUrl = form.watch("imageUrl");

  function onSubmit(values: CreateMessageType) {
    createThreadMutation.mutate({
      ...values,
      imageUrl: imageUrl ?? undefined,
    });
  }

  return (
    <form id="thread-form">
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
                isSubmitting={createThreadMutation.isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
