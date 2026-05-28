import { MembershipRole } from "@/generated/prisma/enums";
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
  threadId: z.string().optional(),
});

export type CreateMessageType = z.infer<typeof createMessageSchema>;

export const inviteMemberSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum(MembershipRole),
  organizationId: z.string(),
  resend: z.boolean(),
  teamId: z.string().nullable(),
});

export type InviteMemberSchemaType = z.infer<typeof inviteMemberSchema>;

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().trim().min(1, "content is required"),
});

export type UpdateMessageSchemaType = z.infer<typeof updateMessageSchema>;
