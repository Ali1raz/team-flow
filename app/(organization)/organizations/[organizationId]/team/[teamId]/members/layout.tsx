import type { Metadata } from "next";
import { client } from "@/lib/orpc";

type Props = { params: Promise<{ teamId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamId } = await params;
  const { team } = await client.team.get({ teamId });

  return {
    title: `${team} | Members`,
  };
}

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
