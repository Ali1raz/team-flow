import z from "zod/v3";
import { inviteMemberSchema } from "../(workspace)/workspaces/schema";
import { heavyWritesecurityMiddleware } from "../middlewares/arcjet/heavy-write-middleware";
import { standardsecurityMiddleware } from "../middlewares/arcjet/standard";
import { requireAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/bast";
import { requireworkspaceMiddleware } from "../middlewares/workspace";
import { auth } from "@/lib/auth";
import { errorMessage } from "@/lib/error-message";
import { headers } from "next/headers";

export const inviteMember = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(standardsecurityMiddleware)
  .use(heavyWritesecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace/members/invite",
    summary: "Invite members to the workspace",
    tags: ["members"],
  })
  .input(inviteMemberSchema)
  .output(z.void())
  .handler(async ({ input, errors }) => {
    console.log("[inviteMember]:", { input });

    try {
      await auth.api.createInvitation({
        body: {
          email: input.email,
          role: input.role,
          organizationId: input.organizationId,
          resend: input.resend,
          teamId: input.teamId ?? undefined,
        },
        headers: await headers(),
      });
    } catch (error) {
      console.log(error);
      throw errors.INTERNAL_SERVER_ERROR({
        message: errorMessage(error, "Failed to create invite"),
      });
    }
  });
