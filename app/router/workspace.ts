import { auth, FullOrg, User } from "@/lib/auth";
import { headers } from "next/headers";
import z from "zod";
import { base } from "../middlewares/bast";
import { requireAuthMiddleware } from "../middlewares/auth";
import { requireworkspaceMiddleware } from "../middlewares/workspace";

export const listWorkspaces = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .route({
    method: "GET",
    path: "/workspace",
    summary: "List all workspaces",
    tags: ["Workspace"],
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          logo: z.string().nullable().optional(),
        })
      ),
      user: z.custom<User>(),
      currentWorkspace: z.custom<FullOrg>(),
    })
  )
  .handler(async ({ context }) => {
    const data = await auth.api.listOrganizations({
      // This endpoint requires session cookies.
      headers: await headers(),
    });

    return {
      workspaces: data.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
      })),
      user: context.user,
      currentWorkspace: context.workspace,
    };
  });
