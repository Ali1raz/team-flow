import { auth, User } from "@/lib/auth";
import { base } from "./bast";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuthMiddleware = base
  .$context<{
    session?: { user?: User };
  }>()
  .middleware(async ({ context, next }) => {
    const session = context.session ?? (await getSession());

    if (!session || !session.user) {
      return redirect("/login");
    }
    return next({
      context: { user: session.user },
    });
  });

const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};
