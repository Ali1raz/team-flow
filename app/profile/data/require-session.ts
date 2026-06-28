import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { Route } from "next";

export const requireSession = cache(async (currentPath?: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const loginUrl = `/login?from=${encodeURIComponent(currentPath || "/")}`;
    return redirect(loginUrl as Route);
  }

  return session;
});
