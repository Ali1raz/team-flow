import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invite",
};

export default function AcceptInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
