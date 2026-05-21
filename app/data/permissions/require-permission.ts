import { auth } from "@/lib/auth";
import { PermissionMap } from "@/lib/permissions";
import { headers } from "next/headers";

/// for server components
/// checks if the current user has the specified permissions
export async function requirePermission(
  permissions: PermissionMap
): Promise<boolean> {
  const can = await auth.api.hasPermission({
    body: { permissions },
    headers: await headers(),
  });
  if (can.error) {
    return false;
  }
  return can.success;
}
