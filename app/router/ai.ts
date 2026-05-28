import z from "zod/v3";
import { requireAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/bast";
import { requireworkspaceMiddleware } from "../middlewares/workspace";
import { prisma } from "@/lib/prisma";
import { formatLocalDateTime, jsonToMarkdown } from "@/lib/utils";
import { streamText } from "ai";
import { openrouter } from "@/lib/open-router";
import { streamToEventIterator } from "@orpc/server";

export const generateThreadSummary = base
  .use(requireAuthMiddleware)
  .use(requireworkspaceMiddleware)
  .route({
    method: "GET",
    path: "/ai/threads/summary",
    summary: "Generate a summary of the thread",
    tags: ["ai"],
  })
  .input(
    z.object({
      threadId: z.string(),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const parentMessage = await prisma.message.findFirst({
      where: {
        threadId: input.threadId,
        team: {
          organizationId: context.workspace.id,
        },
      },
      select: {
        id: true,
        threadId: true,
        teamId: true,
      },
    });

    if (!parentMessage) {
      throw errors.NOT_FOUND();
    }

    const threadId = parentMessage.threadId ?? parentMessage.id;

    const parent = await prisma.message.findFirst({
      where: {
        id: threadId,
        team: {
          organizationId: context.workspace.id,
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        replies: {
          orderBy: {
            createdAt: "desc", // newest replies first
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw errors.NOT_FOUND();
    }

    const replies = parent.replies.slice().reverse();

    const parentText = await jsonToMarkdown(parent.content);

    const lines = [];

    lines.push(
      `Thread root - ${parent.user.name} - ${formatLocalDateTime(parent.createdAt)}`
    );

    lines.push(parentText);

    if (replies.length > 0) {
      lines.push("---");
      for (const reply of replies) {
        const replyText = await jsonToMarkdown(reply.content);
        lines.push(
          `${reply.user.name} - ${formatLocalDateTime(reply.createdAt)}: ${replyText}`
        );
      }
    }

    const compiled = lines.join("\n");
    console.log("=========");
    console.log("Replies", replies.length);

    console.log("compiled", compiled);
    console.log("=========");

    const result = streamText({
      model: openrouter("z-ai/glm-4.5-air:free"),
      system: `You are an export assisstant summarizing SLack-like discussion threads for product team.
        Use only provuded thread content, dont invent facts, names or timelines
        Output format (Markdown):
        - first, write a single concise paragraph (2-4 sentences) that captures the thread's purpose, key dicisions,  context and any blockers or nxt steps, no heading, no list, no intro text
        Then add black line followed by exactly 2-3 bullet points (using -) withthe most imporant takeaways, each line is one sentence
        style: neutral, specific and concise. Preserve terminology, names, or acronyms. avoid filler or meta-commentary, dont add closing sentance.
        - if the context is insufficent, return a signle sentance summary and omit the bullet list`,
      messages: [{ role: "user", content: compiled }], // single-turn — compiled prompt already contains all context (history, instructions, data), no need for multi-message conversation format
      temperature: 0.2, // low temperature for consistent, deterministic output; avoids hallucinations in structured/factual responses — raise to 0.7+ for creative tasks
    });

    return streamToEventIterator(result.toUIMessageStream());
  });
