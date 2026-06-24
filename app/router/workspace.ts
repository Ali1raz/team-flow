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
import { requireworkspaceMiddleware } from "../middlewares/workspace";
import { MembershipRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireMemberMiddleware } from "../middlewares/member";

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

export const listWorkspaceMembers = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .route({
    method: "GET",
    path: "/workspace/:workspaceId/members",
    summary: "List all members of a workspace",
    tags: ["Workspace"],
  })
  .input(z.void())
  .output(
    z.object({
      members: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          image: z.string().nullable(),
          role: z.enum([...Object.values(MembershipRole)]),
        })
      ),
    })
  )
  .handler(async ({ context, errors }) => {
    let workspacemembers;
    try {
      workspacemembers = await prisma.member.findMany({
        where: {
          organizationId: context.workspace.id,
        },
        select: {
          role: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to list workspace members"),
      });
    }

    const members = workspacemembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image ?? null,
      role: member.role ?? "member",
    }));

    return {
      members,
    };
  });

export const updateWorkspaceMemberRole = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(requireMemberMiddleware)
  .use(standardsecurityMiddleware)
  .use(heavyWritesecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace/members/update-role",
    summary: "Update a member's role in the workspace",
    tags: ["workspace"],
  })
  .input(
    z.object({
      userId: z.string(),
      role: z.enum([...Object.values(MembershipRole)]),
      organizationId: z.string().optional(),
    })
  )
  .output(z.void())
  .handler(async ({ context, input, errors }) => {
    if (!["owner", "admin"].includes(context.member.role)) {
      throw errors.FORBIDDEN({
        message: "Only admins and owners can update member roles",
      });
    }

    const orgId = input.organizationId ?? context.workspace.id;

    const member = await prisma.member.findFirst({
      where: {
        userId: input.userId,
        organizationId: orgId,
      },
      select: { id: true },
    });

    if (!member) {
      throw errors.NOT_FOUND({ message: "Member not found in this workspace" });
    }

    try {
      await auth.api.updateMemberRole({
        body: {
          memberId: member.id,
          role: input.role,
          organizationId: orgId,
        },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to update member role"),
      });
    }
  });
