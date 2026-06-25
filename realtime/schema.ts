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

export const RealtimeMessageSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  teamId: z.string().nullable(),
  threadId: z.string().nullable(),
  content: z.string(),
   imageUrl: z.string().nullable().optional(),
  repliesCount: z.number().optional(),
  user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
      email: z.string(),
    }),
});

export type RealtimeMessageSchemaType = z.infer<typeof RealtimeMessageSchema>;

export const RealtimechannelEventSchema = z.union([
  z.object({
    type: z.literal("message:created"),
    payload: z.object({ message: RealtimeMessageSchema }),
  }),
  z.object({
    type: z.literal("message:updated"),
    payload: z.object({ message: RealtimeMessageSchema }),
  }),
  z.object({
    type: z.literal("message:reply:increment"),
    payload: z.object({ messageId: z.string(), delta: z.number() }),
  }),
]);

export type RealtimechannelEventSchemaType = z.infer<
  typeof RealtimechannelEventSchema
>;
