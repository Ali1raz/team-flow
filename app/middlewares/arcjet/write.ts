import arcjet, { detectBot, slidingWindow } from "@/lib/arcjet";
import { base } from "../bast";
import { User } from "@/lib/auth";
import { formatLocalDateTime } from "@/lib/utils";
import { ArcjetNextRequest } from "@arcjet/next";

const standardAj = () =>
  arcjet
    .withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: 20,
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

export const writesecurityMiddleware = base
  .$context<{
    request: Request | ArcjetNextRequest;
    user: User;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const dec = await standardAj().protect(context.request, {
      userId: context.user.id,
    });

    if (dec.isDenied()) {
      if (dec.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: `You are making too many requests. Please try again later on: ${formatLocalDateTime(dec.reason.resetTime as Date)}.`,
        });
      }

      if (dec.reason.isBot()) {
        throw errors.FORBIDDEN({
          message: "Bot detected. Request blocked!",
        });
      }

      throw errors.FORBIDDEN({
        message: "Request blocked!",
      });
    }

    return next();
  });
