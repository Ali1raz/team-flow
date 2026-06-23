import { FullOrg, User } from "@/lib/auth";
import { base } from "./bast";

export const requireMemberMiddleware = base
  .$context<{
    workspace: FullOrg;
    user: User;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const member = context.workspace.members.find(
      (m) => m.userId === context.user.id
    );
    if (!member) {
      throw errors.FORBIDDEN();
    }
    return next({
      context: { member },
    });
  });
