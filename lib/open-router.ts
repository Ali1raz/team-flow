import { env } from "@/lib/env";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

export const model = "z-ai/glm-4.5-air:free";
