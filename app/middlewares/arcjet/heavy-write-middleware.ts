import arcjet, { detectBot, slidingWindow } from "@/lib/arcjet";
import { base } from "../bast";
import { User } from "@/lib/auth";
import { formatLocalDateTime } from "@/lib/utils";

const standardAj = () =>
  arcjet
    .withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: 2,
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

export const heavyWritesecurityMiddleware = base
  .$context<{
    request: Request;
    user: User;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const dec = await standardAj().protect(context.request, {
      userId: context.user.id,
    });

    if (dec.isDenied()) {
      if (dec.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: `You are making too many requests. Please try again later after: ${formatLocalDateTime(dec.reason.resetTime as Date)}.`,
        });
      }

      throw errors.FORBIDDEN({
        message: "Request blocked!",
      });
    }

    return next();
  });
