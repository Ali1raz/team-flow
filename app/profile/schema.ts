import z from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be 3 chars long." })
    .max(20, { message: "Name must be less than 20 chars." }),
  imageKey: z.string().optional(),
});
export type UpdateProfileType = z.infer<typeof updateProfileSchema>;
