/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Field, FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { createMessageSchema, CreateMessageType } from "../../schema";
import { Messagecomponser } from "./message-omposer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useState } from "react";

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

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
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
      onError: (error) => {
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
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
