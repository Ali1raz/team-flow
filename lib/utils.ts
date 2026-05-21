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
