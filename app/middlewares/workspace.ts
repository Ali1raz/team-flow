import { auth, FullOrg } from "@/lib/auth";
import { base } from "./bast";
import { headers } from "next/headers";

export const requireworkspaceMiddleware = base
  .$context<{
    workspace?: FullOrg;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const workspace = context.workspace ?? (await getcuurentworkspace());

    if (!workspace) {
      throw errors.FORBIDDEN();
    }
    return next({
      context: { workspace: workspace },
    });
  });

const getcuurentworkspace = async () => {
  const org = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  return org;
};
