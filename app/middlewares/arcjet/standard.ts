import arcjet, { detectBot, shield } from "@/lib/arcjet";
import { base } from "../bast";
import { User } from "@/lib/auth";
import { ArcjetNextRequest } from "@arcjet/next";

const standardAj = () =>
  arcjet
    .withRule(
      shield({
        mode: "LIVE",
      })
    )
    .withRule(
      detectBot({
        mode: "LIVE",
        allow: [
          "CATEGORY:SEARCH_ENGINE",
          "CATEGORY:PREVIEW",
          "CATEGORY:MONITOR",
        ],
      })
    );

export const standardsecurityMiddleware = base
  .$context<{
    request: Request | ArcjetNextRequest;
    user: User;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const dec = await standardAj().protect(context.request, {
      userId: context.user.id,
    });

    if (dec.isDenied()) {
      if (dec.reason.isBot()) {
        throw errors.RATE_LIMITED({
          message: "Bot activity detected. Automated traffic blocked.",
        });
      }

      if (dec.reason.isShield()) {
        throw errors.FORBIDDEN({
          message: "Access denied by security rules (WAF).",
        });
      }

      throw errors.FORBIDDEN({
        message: "Request blocked!",
      });
    }

    return next();
  });
