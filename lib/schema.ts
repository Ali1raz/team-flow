import z from "zod/v3";

export const updateChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Channel name must be greater than 2 chars")
    .max(20, "Channel name must be less than 20 chars"),
  chanelId: z.string().min(1, "Channel id is required"),
});

export type UpdateChannelType = z.infer<typeof updateChannelSchema>;
