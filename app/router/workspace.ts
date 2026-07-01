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
          role: z.enum([...Object.values(MembershipRole)]),
          totalMembers: z.number(),
          totalChannels: z.number(),
        })
      ),
      user: z.custom<User>(),
      currentWorkspace: z.custom<FullOrg | null>(),
    })
  )
  .handler(async ({ context }) => {
    const [data, currentWorkspace, memberRoles, counts] = await Promise.all([
      auth.api.listOrganizations({ headers: await headers() }),
      auth.api.getFullOrganization({ headers: await headers() }),
      prisma.member.findMany({
        where: { userId: context.user.id },
        select: { organizationId: true, role: true },
      }),
      prisma.organization.findMany({
        where: {
          members: { some: { userId: context.user.id } },
        },
        select: {
          id: true,
          _count: {
            select: {
              members: true,
              teams: true,
            },
          },
        },
      }),
    ]);

    const countMap = new Map(counts.map((o) => [o.id, o._count]));
    const roleMap = new Map(memberRoles.map((m) => [m.organizationId, m.role]));

    return {
      workspaces: data.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        role: roleMap.get(org.id) ?? "member",
        totalMembers: countMap.get(org.id)?.members ?? 0,
        totalChannels: countMap.get(org.id)?.teams ?? 0,
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

export const updateWorkspace = base
  .use(requireAuthMiddleware)
  .use(standardsecurityMiddleware)
  .use(heavyWritesecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace/update",
    summary: "Update a workspace",
    tags: ["Workspace"],
  })
  .input(
    z.object({
      workspaceId: z.string(),
      name: z.string().trim().min(1, "Workspace name is required"),
      logo: z.string().nullable().optional(),
    })
  )
  .output(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      logo: z.string().nullable().optional(),
    })
  )
  .handler(async ({ input, errors }) => {
    const slug = createSlug(input.name);

    let data;
    try {
      data = await auth.api.updateOrganization({
        body: {
          data: {
            name: input.name,
            slug,
            logo: input.logo ?? undefined,
          },
          organizationId: input.workspaceId,
        },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to update workspace"),
      });
    }

    if (!data) {
      throw errors.NOT_FOUND({
        message: "Workspace not found",
      });
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
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

export const listWorkspaceInvitations = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .route({
    method: "GET",
    path: "/workspace/:workspaceId/invitations",
    summary: "List all invitations for a workspace",
    tags: ["Workspace"],
  })
  .input(
    z.object({
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      invitations: z.array(
        z.object({
          id: z.string(),
          organizationId: z.string(),
          email: z.string(),
          role: z.enum(MembershipRole),
          status: z.string(),
          expiresAt: z.coerce.date(),
          createdAt: z.coerce.date(),
          inviter: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            image: z.string().nullable(),
          }),
          invitedUser: z
            .object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              image: z.string().nullable(),
            })
            .nullable(),
          team: z
            .object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
            })
            .nullable(),
        })
      ),
    })
  )
  .handler(async ({ context, input, errors }) => {
    if (input.workspaceId !== context.workspace.id) {
      throw errors.BAD_REQUEST({
        message: "You recently switched workspace",
      });
    }

    let data;

    try {
      data = await auth.api.listInvitations({
        query: {
          organizationId: context.workspace.id,
        },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: errorMessage(error, "Failed to list invitations"),
      });
    }

    const inviterIds = [...new Set(data.map((inv) => inv.inviterId))];
    const teamIds = data.map((inv) => inv.teamId).filter(Boolean) as string[];
    const emails = data.map((inv) => inv.email);

    const [inviters, teams, invitedUsers] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: inviterIds } },
        select: { id: true, name: true, email: true, image: true },
      }),
      prisma.team.findMany({
        where: { id: { in: teamIds } },
        select: { id: true, name: true, slug: true },
      }),
      prisma.user.findMany({
        where: { email: { in: emails } },
        select: { id: true, name: true, email: true, image: true },
      }),
    ]);

    const inviterMap = new Map(inviters.map((u) => [u.id, u]));
    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const invitedUserMap = new Map(invitedUsers.map((u) => [u.email, u]));

    const sorted = [...data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      invitations: sorted.map((inv) => ({
        id: inv.id,
        organizationId: inv.organizationId,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        inviter: inviterMap.get(inv.inviterId)!,
        invitedUser: invitedUserMap.get(inv.email) ?? null,
        team: inv.teamId ? (teamMap.get(inv.teamId) ?? null) : null,
      })),
    };
  });

export const cancelWorkspaceInvitation = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(standardsecurityMiddleware)
  .use(heavyWritesecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace/invitations/cancel",
    summary: "Cancel a workspace invitation",
    tags: ["Workspace"],
  })
  .input(
    z.object({
      invitationId: z.string(),
      workspaceId: z.string(),
    })
  )
  .output(z.void())
  .handler(async ({ context, input, errors }) => {
    if (input.workspaceId !== context.workspace.id) {
      throw errors.BAD_REQUEST({
        message: "You recently switched workspace",
      });
    }

    try {
      await auth.api.cancelInvitation({
        body: {
          invitationId: input.invitationId,
        },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: errorMessage(error, "Failed to cancel invitation"),
      });
    }
  });

export const leaveWorkspace = base
  .use(requireAuthMiddleware)
  .route({
    method: "POST",
    path: "/workspace/leave",
    summary: "Leave a workspace",
    tags: ["Workspace"],
  })
  .input(z.object({ organizationId: z.string() }))
  .output(z.void())
  .handler(async ({ context, input, errors }) => {
    const { user } = context;
    const { organizationId } = input;

    // better-auth throws if sole owner
    try {
      await auth.api.leaveOrganization({
        body: { organizationId },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to leave workspace"),
      });
    }

    // No hook fires on leave, so clean up teamMember records manually
    await prisma.teamMember.deleteMany({
      where: {
        userId: user.id,
        team: { organizationId },
      },
    });

    console.log("Left workspace", organizationId);
  });
