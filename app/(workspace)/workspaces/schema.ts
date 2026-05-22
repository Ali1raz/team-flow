import z from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});

export type CreateWorkspaceType = z.infer<typeof createWorkspaceSchema>;
