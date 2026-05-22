import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COLOR_COMBOS } from "./app/data";

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
