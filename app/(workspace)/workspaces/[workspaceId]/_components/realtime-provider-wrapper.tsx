"use client";
import { useParams } from "next/navigation";
import { RealtimeChannelProvider } from "@/components/channel-realtime-provider";

export function RealtimeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { channelId } = useParams<{ channelId?: string }>();

  if (!channelId) return <>{children}</>;

  return (
    <RealtimeChannelProvider channelId={channelId}>
      {children}
    </RealtimeChannelProvider>
  );
}
