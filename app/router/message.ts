import z from "zod";
import { standardsecurityMiddleware } from "../middlewares/arcjet/standard";
import { writesecurityMiddleware } from "../middlewares/arcjet/write";
import { requireAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/bast";
import { requireworkspaceMiddleware } from "../middlewares/workspace";
import { prisma } from "@/lib/prisma";
import { createMessageSchema } from "../(workspace)/workspaces/schema";
import { Message } from "@/generated/prisma/client";
import { readsecurityMiddleware } from "../middlewares/arcjet/read";

export const createMessage = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(standardsecurityMiddleware)
  .use(writesecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages",
    summary: "create new message",
    tags: ["message"],
  })
  .input(createMessageSchema)
  .output(z.custom<Message>())
  .handler(async ({ context, input, errors }) => {
    const channel = await prisma.team.findFirst({
      where: {
        id: input.channelId,
        organizationId: context.workspace.id,
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    if (channel.organizationId !== context.workspace.id) {
      throw errors.FORBIDDEN();
    }

    console.log(
      "Creating message in channel:",
      channel.id,
      "by user:",
      context.user.name
    );

    const message = await prisma.message.create({
      data: {
        content: input.content,
        imageUrl: input.imageUrl,
        teamId: input.channelId,
        userId: context.user.id,
      },
    });

    return {
      ...message,
    };
  });

export const listMessages = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .use(standardsecurityMiddleware)
  .use(readsecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages",
    summary: "List messages",
    tags: ["message"],
  })
  .input(
    z.object({
      channelId: z.string(),
    })
  )
  .output(
    z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        imageUrl: z.string().nullable().optional(),
        createdAt: z.date(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          image: z.string().nullable(),
        }),
      })
    )
  )
  .handler(async ({ context, errors, input }) => {
    const channel = await prisma.team.findFirst({
      where: {
        id: input.channelId,
        organizationId: context.workspace.id,
      },
      select: {
        id: true,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    const messages = await prisma.message.findMany({
      where: {
        teamId: channel.id,
      },
      orderBy: {
        createdAt: "desc", // latest messages first
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        createdAt: true,
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
    return messages;
  });
