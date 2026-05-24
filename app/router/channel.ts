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
      });
    } catch (error: unknown) {
      throw errors.BAD_REQUEST({
        message: errorMessage(error, "Failed to create channel"),
      });
    }
    console.log(context.user.name);

    return { ...data, updatedAt: data.updatedAt ?? null };
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
        })
      ),
      activeTeamId: z.string().nullable(),
    })
  )
  .handler(async ({ context, input }) => {
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

    const activeTeamId = context?.session?.activeTeamId ?? null;

    const teamMembers = activeTeamId
      ? await prisma.teamMember.findMany({
          where: { teamId: activeTeamId },
          select: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        })
      : [];

    return {
      channels,
      members: teamMembers.map((m) => m.user),
      activeTeamId,
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
