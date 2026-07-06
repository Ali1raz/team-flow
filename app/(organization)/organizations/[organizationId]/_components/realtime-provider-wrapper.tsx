"use client";
import { useParams } from "next/navigation";
import { RealtimeTeamProvider } from "@/components/team-realtime-provider";

export function RealtimeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { teamId } = useParams<{ teamId?: string }>();

  if (!teamId) return <>{children}</>;

  return (
    <RealtimeTeamProvider teamId={teamId}>{children}</RealtimeTeamProvider>
  );
}
