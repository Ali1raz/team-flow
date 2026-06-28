"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ApiResponseType } from "@/lib/types";
import { updateProfileSchema, UpdateProfileType } from "./schema";
import { requireSession } from "./data/require-session";

export async function updateProfileAction(
  values: UpdateProfileType,
  currentUserId: string
): Promise<ApiResponseType> {
  const { user } = await requireSession();

  try {
    if (user.id !== currentUserId) {
      return {
        status: "error",
        message: "You are not authorized to update this profile",
      };
    }

    const validated = updateProfileSchema.safeParse(values);

    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validated.data.name,
        image: validated.data.imageKey,
      },
    });
    return {
      status: "success",
      message: "Profile Updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update profile",
    };
  }
}
