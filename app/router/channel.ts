import z from "zod";
import { createChannelSchema } from "../(workspace)/workspaces/schema";
import { heavyWritesecurityMiddleware } from "../middlewares/arcjet/heavy-write-middleware";
import { standardsecurityMiddleware } from "../middlewares/arcjet/standard";
import { requireAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/bast";
import { requireworkspaceMiddleware } from "../middlewares/workspace";
import { auth, type User } from "@/lib/auth";
import { createSlug } from "@/lib/utils";
import { errorMessage } from "@/lib/error-message";
import { prisma } from "@/lib/prisma";
import { readsecurityMiddleware } from "../middlewares/arcjet/read";
import { headers } from "next/headers";
import { MembershipRole } from "@/generated/prisma/enums";
import { updateChannelSchema } from "@/lib/schema";
import { requireMemberMiddleware } from "../middlewares/member";

export const createChannel = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(requireMemberMiddleware)
  .use(standardsecurityMiddleware)
  .use(heavyWritesecurityMiddleware)
  .route({
    method: "POST",
    path: "/channel",
    summary: "create new channel",
    tags: ["channel"],
  })
  .input(createChannelSchema)
  .output(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      organizationId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date().nullable().optional(),
    })
  )
  .handler(async ({ context, input, errors }) => {
    if (!["owner", "admin"].includes(context.member.role)) {
      throw errors.FORBIDDEN({
        message: "Only admins and owners in this workspace can create channels",
      });
    }

    const slug = createSlug(input.name);
    let data;
    try {
      data = await auth.api.createTeam({
        body: {
          name: input.name,
          slug,
          organizationId: context.workspace.id,
        },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to create channel"),
      });
    }

    return { ...data, updatedAt: data.updatedAt ?? null };
  });

export const updateChannel = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(requireMemberMiddleware)
  .use(standardsecurityMiddleware)
  .use(heavyWritesecurityMiddleware)
  .route({
    method: "PUT",
    path: "/channel/:channelId",
    summary: "update channel",
    tags: ["channel"],
  })
  .input(updateChannelSchema)
  .output(
    z.object({
      name: z.string(),
      organizationId: z.string(),
    })
  )
  .handler(async ({ context, input, errors }) => {
    if (!["owner", "admin"].includes(context.member.role)) {
      throw errors.FORBIDDEN({
        message: "Only admins and owners can update channel",
      });
    }

    const slug = createSlug(input.name);
    let data;
    try {
      data = await auth.api.updateTeam({
        body: {
          teamId: input.chanelId,
          data: {
            name: input.name,
            slug,
            organizationId: context.workspace.id,
          },
        },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to update channel"),
      });
    }

    if (!data) {
      throw errors.NOT_FOUND({ message: "Channel not found" });
    }

    return { name: data.name, organizationId: data.organizationId };
  });

export const listChannels = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .route({
    method: "GET",
    path: "/channel",
    summary: "List all channels",
    tags: ["channel"],
  })
  .input(
    z.object({
      organizationId: z.string(),
    })
  )
  .output(
    z.object({
      channels: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          createdAt: z.date(),
          updatedAt: z.date().nullable().optional(),
          totalMembers: z.number(),
        })
      ),
    })
  )
  .handler(async ({ input }) => {
    const channels = await prisma.team.findMany({
      where: {
        organizationId: input.organizationId,
      },
      orderBy: {
        createdAt: "desc", // newest channels first
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { teammembers: true, messages: true },
        },
      },
    });

    return {
      channels: channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        slug: channel.slug,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
        totalMembers: channel._count.teammembers ?? 0,
      })),
    };
  });

export const getChannel = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(readsecurityMiddleware)
  .use(standardsecurityMiddleware)
  .route({
    method: "GET",
    path: "/channel/:channelId",
    summary: "Get a channel",
    tags: ["channel"],
  })
  .input(
    z.object({
      channelId: z.string(),
    })
  )
  .output(
    z.object({
      channel: z.string(),
      currentUser: z.custom<User>(),
    })
  )
  .handler(async ({ input, context, errors }) => {
    console.log("[channel.get]: called for", input.channelId);
    const channel = await prisma.team.findUnique({
      where: { id: input.channelId },
      select: {
        name: true,
      },
    });

    if (!channel) {
      throw errors.NOT_FOUND({ message: "Channel not found" });
    }

    return {
      channel: channel.name,
      currentUser: context.user,
    };
  });

export const deleteChannel = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(requireMemberMiddleware)
  .use(standardsecurityMiddleware)
  .route({
    method: "DELETE",
    path: "/channel/:channelId",
    summary: "Delete a channel",
    tags: ["channel"],
  })
  .input(
    z.object({
      channelId: z.string(),
    })
  )
  .output(
    z.object({
      organizationId: z.string(),
    })
  )
  .handler(async ({ input, context, errors }) => {
    if (!["owner", "admin"].includes(context.member.role)) {
      throw errors.FORBIDDEN({
        message: "Only admins and owners can delete channels",
      });
    }

    try {
      await auth.api.removeTeam({
        body: {
          teamId: input.channelId,
          organizationId: context.workspace.id,
        },
        headers: await headers(),
      });
    } catch (error: unknown) {
      console.log(error);
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to delete channel"),
      });
    }

    return {
      organizationId: context.workspace.id,
    };
  });

export const addMembersToChannel = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(requireMemberMiddleware)
  .use(standardsecurityMiddleware)
  .route({
    method: "POST",
    path: "/channel/:channelId/add-members",
    summary: "Add members to a channel",
    tags: ["channel"],
  })
  .input(
    z.object({
      channelId: z.string(),
      memberIds: z.array(z.string()),
    })
  )
  .output(z.void())
  .handler(async ({ input, context, errors }) => {
    if (!["owner", "admin"].includes(context.member.role)) {
      throw errors.FORBIDDEN({
        message: "Only admins and owners can add members to a channel",
      });
    }
    try {
      await Promise.all(
        input.memberIds.map(async (userId) => {
          return auth.api.addTeamMember({
            body: { teamId: input.channelId, userId },
            headers: await headers(),
          });
        })
      );
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to add members to channel"),
      });
    }
  });

export const removeMemberFromChannel = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(requireMemberMiddleware)
  .use(standardsecurityMiddleware)
  .route({
    method: "POST",
    path: "/channel/:channelId/remove-member",
    summary: "Remove member from a channel",
    tags: ["channel"],
  })
  .input(
    z.object({
      channelId: z.string(),
      memberId: z.string(),
    })
  )
  .output(z.void())
  .handler(async ({ input, context, errors }) => {
    if (!["owner", "admin"].includes(context.member.role)) {
      throw errors.FORBIDDEN({
        message: "Only admins and owners can remove members from a channel",
      });
    }
    try {
      await auth.api.removeTeamMember({
        body: { teamId: input.channelId, userId: input.memberId },
        headers: await headers(),
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to remove member from channel"),
      });
    }
  });

export const listChannelMembers = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(standardsecurityMiddleware)
  .route({
    method: "GET",
    path: "/channel/:channelId/members",
    summary: "List members of a channel",
    tags: ["channel"],
  })
  .input(
    z.object({
      channelId: z.string(),
    })
  )
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
  .handler(async ({ context, input, errors }) => {
    let rawMembers;
    try {
      rawMembers = await prisma.teamMember.findMany({
        where: { teamId: input.channelId },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              members: {
                where: { organizationId: context.workspace.id },
                select: { role: true },
                take: 1,
              },
            },
          },
        },
      });
    } catch (error) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to list channel members"),
      });
    }

    const members = rawMembers.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image ?? null,
      role: m.user.members?.[0]?.role ?? "member",
    }));

    return { members };
  });
