import arcjet, { detectBot, sensitiveInfo, slidingWindow } from "@/lib/arcjet";
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
    )
    .withRule(
      sensitiveInfo({
        mode: "LIVE",
        deny: ["CREDIT_CARD_NUMBER", "PHONE_NUMBER"],
      })
    );

export const writesecurityMiddleware = base
  .$context<{
    request: Request | ArcjetNextRequest;
    user: User;
  }>()
  .middleware(async ({ context, next, errors, input }) => {
    const sensitiveInfoValue =
      typeof input === "object" && input !== null && "content" in input
        ? String((input as { content?: unknown }).content ?? "")
        : "";

    const dec = await standardAj().protect(context.request, {
      userId: context.user.id,
      sensitiveInfoValue,
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

      if (dec.reason.isSensitiveInfo()) {
        throw errors.FORBIDDEN({
          message:
            "Sensitive information detected. Please remove PII (e.g. credit card numbers, phone numbers) and try again!",
        });
      }

      throw errors.FORBIDDEN({
        message: "Request blocked!",
      });
    }

    return next();
  });
