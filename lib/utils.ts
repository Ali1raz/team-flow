import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COLOR_COMBOS } from "./app/data";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";
import { baseExtensions } from "@/components/editor/extensions";
import MarkdownIt from "markdown-it";
import Dompurify from "dompurify";
import { generateJSON } from "@tiptap/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWorkspaceColor(id: string) {
  const charsum = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const colorIndex = charsum % COLOR_COMBOS.length;

  return COLOR_COMBOS[colorIndex];
}

export function createSlug(input: string) {
  // Derive a safe workspace slug from user input and strip edge dashes.
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createAvatarUrl(seed = "ar") {
  // Build a deterministic DiceBear avatar URL so the same seed always returns the same avatar.
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}`;
}

export function formatLocalDateTime(createdAt: string | number | Date) {
  // Keep date formatting consistent across the app while still respecting the user's local timezone.
  return new Date(createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * trim trailing whitespaces and collapse >2 blank lines
 */
function normalizeWhitespace(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Converts a JSON string to a Markdown string using the Tiptap static renderer.
 *
 * see https://tiptap.dev/docs/editor/api/utilities/static-renderer
 */
export async function jsonToMarkdown(json: string) {
  let content;
  try {
    content = JSON.parse(json);
  } catch {
    return "";
  }

  return normalizeWhitespace(
    renderToMarkdown({
      extensions: baseExtensions,
      content,
    })
  );
}

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

export function markdownToJson(markdown: string) {
  const html = md.render(markdown);
  const cleaned = Dompurify.sanitize(html, { USE_PROFILES: { html: true } });

  return generateJSON(cleaned, baseExtensions);
}
