import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    lastLoginMethodClient({
      cookieName: "teamflow.last_used_login_method", // match the server-side plugin's cookie name
    }),
    organizationClient({
      ac,
      roles,
      teams: {
        enabled: true,
      },
    }),
  ],
});
