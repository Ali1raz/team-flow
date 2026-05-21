import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { organization } from "better-auth/plugins";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: {
    allowedHosts: [
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
      "*.vercel.app", // All Vercel previews
      "localhost:*", // Local development all ports
    ],
    fallback: "localhost:3000",
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      ac,
      roles,
    }),
  ],
});
