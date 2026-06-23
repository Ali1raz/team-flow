import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { organization } from "better-auth/plugins";
import { ac, roles } from "./permissions";
import { SendEmail } from "@/app/action";
import { createSlug } from "./utils";

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
      async sendInvitationEmail(data) {
        const {
          email,
          organization: { name },
          inviter: {
            user: { name: inviterName },
          },
          role,
        } = data;
        const message = `You have been invited to join ${name} as a ${role} by ${inviterName}. click the link below to accept.`;

        await SendEmail({
          to: email,
          subject: `Invitation to join ${name}`,
          meta: {
            description: message,
            link: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/accept-invite/${data.id}`,
          },
        });
      },
      organizationHooks: {
        beforeCreateTeam: async ({ team }) => {
          return {
            data: {
              ...team,
              slug: createSlug(team.name),
            },
          };
        },
        afterCreateTeam: async ({ team, user }) => {
          if (!team || !user) {
            console.log("[afterCreateTeam]: Team or user not found");
            return;
          }
          await prisma.teamMember.create({
            data: {
              teamId: team.id,
              userId: user.id,
              createdAt: new Date(),
            },
          });
        },
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
