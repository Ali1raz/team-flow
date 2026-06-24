import { z } from "zod";

export const RealtimeUserSchema = z.object({
  id: z.string(),
});

export type RealtimeUserSchemaType = z.infer<typeof RealtimeUserSchema>;

export const RealtimePresenceSchema = z.union([
  z.object({
    type: z.literal("add-user"),
    payload: RealtimeUserSchema,
  }),
  z.object({
    type: z.literal("remove-user"),
    payload: z.object({
      id: z.string(),
    }),
  }),
  z.object({
    type: z.literal("presence"),
    payload: z.object({ users: z.array(RealtimeUserSchema) }),
  }),
]);

export type RealtimePresenceSchemaType = z.infer<typeof RealtimePresenceSchema>;
