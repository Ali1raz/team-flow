import { auth, FullOrg } from "@/lib/auth";
import { base } from "./bast";
import { headers } from "next/headers";

export const requireOrganizationMiddleware = base
  .$context<{
    organization?: FullOrg;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const organization =
      context.organization ?? (await getCurrentOrganization());

    if (!organization) {
      throw errors.FORBIDDEN();
    }
    return next({
      context: { organization: organization },
    });
  });

const getCurrentOrganization = async () => {
  const org = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  return org;
};
