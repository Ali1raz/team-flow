import type { Metadata } from "next";
import { client } from "@/lib/orpc";

type Props = { params: Promise<{ channelId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channelId } = await params;
  const { channel } = await client.channel.get({ channelId });

  return {
    title: `${channel} | Members`,
  };
}

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
