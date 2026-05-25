"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import z from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

const schema = z.object({
  workspaceId: z.string().min(1, "Please select a workspace"),
});
type SchemaType = z.infer<typeof schema>;

export function WorkspaceList() {
  const [isPending, startTransition] = useTransition();
  const {
    data: { workspaces, currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      workspaceId: currentWorkspace?.id ?? "",
    },
  });

  console.log("===\n=====Current workspace", currentWorkspace?.id);

  const router = useRouter();

  async function onSubmit(values: SchemaType) {
    startTransition(async () => {
      const { data, error } = await authClient.organization.setActive({
        organizationId: values.workspaceId,
      });

      if (error) {
        toast.error("Failed to switch workspace", {
          description: error.message ?? "Unknown error",
        });
        return;
      }

      toast.success("Switched workspace successfully");
      console.log("----\n-----setting active workspace", data.id);
      router.push(`/workspaces/${data.id}`);
    });
  }

  return (
    <div className="flex w-full mx-auto mt-16 max-w-2xl flex-col gap-6">
      <form id="workspace-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="workspaceId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Workspace</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select a workspace</SelectLabel>
                      {workspaces.map((ws) => (
                        <SelectItem key={ws.id} value={ws.id}>
                          {ws.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <Field className="mt-4">
        <Button disabled={isPending} type="submit" form="workspace-form">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Switching...
            </>
          ) : (
            <>Select this workspace</>
          )}
        </Button>
      </Field>
    </div>
  );
}
