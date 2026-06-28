import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function userGetAllSessions() {
  const sessions = await auth.api.listSessions({
    headers: await headers(),
  });

  return sessions;
}

export type UserGetAllSessions = Awaited<
  ReturnType<typeof userGetAllSessions>
>[number];
