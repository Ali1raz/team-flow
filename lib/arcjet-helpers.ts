import arcjet, { sensitiveInfo } from "@/lib/arcjet";

export const sensitiveInfoAj = () =>
  arcjet.withRule(
    sensitiveInfo({
      mode: "LIVE",
      deny: ["CREDIT_CARD_NUMBER", "PHONE_NUMBER"],
    })
  );
