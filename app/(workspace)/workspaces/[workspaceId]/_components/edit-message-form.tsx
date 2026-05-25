"use client";

import { Field, FieldGroup } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { updateMessageSchema, UpdateMessageSchemaType } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { messageType } from "./message-item";
import { orpc } from "@/lib/orpc";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface EditMessageFormProps {
  message: messageType;
  onCancel: () => void;
  onSave: () => void;
}

export function EditMessageForm({
  message,
  onCancel,
  onSave,
}: EditMessageFormProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const form = useForm<UpdateMessageSchemaType>({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: {
      content: message.content,
      messageId: message.id,
    },
    mode: "onChange",
  });

  const queryClient = useQueryClient();

  const updateMessageMutation = useMutation(
    orpc.message.update.mutationOptions({
      onSuccess: (update) => {
        type messagePage = {
          messages: messageType[];
          nextCursor: string | null;
        };
        type infinitMessages = InfiniteData<messagePage>;
        queryClient.setQueryData<infinitMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) =>
                msg.id === update.message.id
                  ? {
                      ...msg,
                      content: update.message.content,
                      imageUrl: update.message.imageUrl,
                    }
                  : msg
              ),
            }));
            return { ...old, pages };
          }
        );
        toast.success("Message updated successfully");
        onSave();
      },
      onError: (error) => {
        toast.error("Failed to update message", {
          description: error.message,
        });
      },
    })
  );

  function onSubmit(values: UpdateMessageSchemaType) {
    updateMessageMutation.mutate(values);
  }

  return (
    <form id="update-message-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="content"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Editor
                field={{ value: field.value, onChange: field.onChange }}
                sendButton={
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      disabled={updateMessageMutation.isPending}
                    >
                      {updateMessageMutation.isPending
                        ? "Updating..."
                        : "Update"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={updateMessageMutation.isPending}
                      onClick={onCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                }
              />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
