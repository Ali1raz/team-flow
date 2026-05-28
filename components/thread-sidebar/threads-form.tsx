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
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { client, orpc } from "@/lib/orpc";
import { toast } from "sonner";

type ThreadsData = Awaited<ReturnType<typeof client.message.threads.list>>;
type ThreadItem = ThreadsData["threads"][number];

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

        // Snapshot the cache so we can roll back on error.
        const prevData = queryClient.getQueryData<ThreadsData>(
          threadsQueryOptions.queryKey
        );

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

        // Return the snapshot so onError can restore it.
        return { prevData };
      },
      onSuccess: () => {
        toast.success("Reply sent successfully");
        form.reset({ channelId, content: "", imageUrl: undefined, threadId });
        form.setValue("imageUrl", undefined);
        setEditorKey((prev) => prev + 1);
        // Replace the optimistic entry with real server data.
        queryClient.invalidateQueries({
          queryKey: threadsQueryOptions.queryKey,
        });
        // Invalidate the message list so the _count.replies counter on the
        // parent message updates to reflect the newly added reply.
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key({
            type: "infinite",
            input: { channelId },
          }),
        });
      },
      onError: (error, _variables, context) => {
        // Roll back to the pre-optimistic snapshot if we have one.
        if (context?.prevData) {
          queryClient.setQueryData(
            threadsQueryOptions.queryKey,
            context.prevData
          );
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
