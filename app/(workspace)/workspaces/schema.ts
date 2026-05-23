import z from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required"),
});

export type CreateWorkspaceType = z.infer<typeof createWorkspaceSchema>;

export const createChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Channel name must be greater than 2 chars")
    .max(20, "Channel name must be less than 20 chars"),
});

export type CreateChannelType = z.infer<typeof createChannelSchema>;

export const createMessageSchema = z.object({
  content: z.string().trim().min(1, "Message content is required"),
  channelId: z.string(),
  imageUrl: z.url().optional(),
});

export type CreateMessageType = z.infer<typeof createMessageSchema>;
