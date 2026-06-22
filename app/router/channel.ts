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

export const createChannel = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
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
        })
      ),
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
  .handler(async ({ input }) => {
    const [channels] = await Promise.all([
      prisma.team.findMany({
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
        },
      }),
    ]);

    const teamMembers = await auth.api.listMembers({
      query: {
        organizationId: input.organizationId,
      },
      headers: await headers(),
    });

    const rawMembers = Array.isArray(teamMembers)
      ? []
      : (teamMembers.members ?? []);

    const members = rawMembers.map((member) => ({
      id: member.userId,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image ?? null,
      role: member.role as MembershipRole,
    }));

    return {
      channels,
      members,
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
