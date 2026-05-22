import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getInitialWorkspace() {
  const ws = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return ws[0].id || null;
}
