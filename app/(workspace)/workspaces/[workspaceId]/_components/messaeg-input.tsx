"use client";

import { Field, FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { createMessageSchema, CreateMessageType } from "../../schema";
import { Messagecomponser } from "./message-omposer";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

interface IAppPops {
  channelId: string;
}

export function MessageInput({ channelId }: IAppPops) {
  const form = useForm<CreateMessageType>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      imageUrl: undefined,
    },
    mode: "onChange",
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message sent successfully");
        form.reset();
      },
      onError: (error) => {
        toast.error("Something bad happened, please try again!", {
          description: error instanceof Error ? error.message : null,
        });
      },
    })
  );

  function onSubmit(values: CreateMessageType) {
    createMessageMutation.mutate(values);
  }

  return (
    <form id="message-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="content"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Messagecomponser field={field} />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
