import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { organization } from "better-auth/plugins";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const firstMember = await prisma.member.findFirst({
            where: { userId: session.userId },
            orderBy: { createdAt: "asc" },
            select: { organizationId: true },
          });

          return {
            data: {
              ...session,
              activeOrganizationId: firstMember?.organizationId ?? null,
            },
          };
        },
      },
    },
  },
  baseURL: {
    allowedHosts: [
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
      "*.vercel.app", // All Vercel previews
      "localhost:*", // Local development all ports
    ],
    fallback: "http://localhost:3000",
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
      schema: {
        team: {
          additionalFields: {
            slug: {
              type: "string",
              required: true,
              input: true,
            },
          },
        },
      },
      teams: {
        enabled: true,
        allowRemovingAllTeams: true,
      },
      allowUserToCreateOrganization: true,
      ac,
      roles,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type FullOrg = typeof auth.$Infer.ActiveOrganization;
