import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { APIError } from "better-auth/api";

export function errorMessage(error: unknown, message?: string): string {
  const suffix = message ? ` ${message}` : "";

  if (error instanceof APIError) {
    if (error.body?.code === "ORGANIZATION_ALREADY_EXISTS") {
      return `Organization with the same name already exists${suffix}`;
    }
    return `${error.status} - ${error.body?.message}${suffix}`;
  } else if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return `Resource not found: ${suffix}`;
    }
    if (error.code === "P2002") {
      return `Resource already exists: ${suffix}`;
    }
    console.log(error.name);
  }

  return `Something went wrong: ${suffix}`;
}
