import { auth, FullOrg, User } from "@/lib/auth";
import { headers } from "next/headers";
import z from "zod";
import { base } from "../middlewares/bast";
import { requireAuthMiddleware } from "../middlewares/auth";
import { createWorkspaceSchema } from "../(workspace)/workspaces/schema";
import { createAvatarUrl, createSlug } from "@/lib/utils";
import { errorMessage } from "@/lib/error-message";
import { standardsecurityMiddleware } from "../middlewares/arcjet/standard";
import { heavyWritesecurityMiddleware } from "../middlewares/arcjet/heavy-write-middleware";

export const listWorkspaces = base
  .use(requireAuthMiddleware)
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
      currentWorkspace: z.custom<FullOrg | null>(),
    })
  )
  .handler(async ({ context }) => {
    const [data, currentWorkspace] = await Promise.all([
      auth.api.listOrganizations({ headers: await headers() }),
      auth.api.getFullOrganization({ headers: await headers() }),
    ]);

    return {
      workspaces: data.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
      })),
      user: context.user,
      currentWorkspace: currentWorkspace,
    };
  });

export const createWorkspace = base
  .use(requireAuthMiddleware)
  .use(standardsecurityMiddleware)
  .use(heavyWritesecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace",
    summary: "Create a new workspace",
    tags: ["Workspace"],
  })
  .input(createWorkspaceSchema)
  .output(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      createdAt: z.string(),
      logo: z.string().nullable().optional(),
    })
  )
  .handler(async ({ context, input, errors }) => {
    const slug = createSlug(input.name);
    console.log("Creating workspace with slug:", slug);

    let data;

    try {
      data = await auth.api.createOrganization({
        body: {
          name: input.name,
          slug: slug,
          logo: createAvatarUrl(slug),
          userId: context.user.id,
          keepCurrentActiveOrganization: false,
        },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to create workspace"),
      });
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      createdAt: data.createdAt.toISOString(),
      logo: data.logo,
    };
  });
