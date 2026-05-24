import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { ReactNode } from "react";
import { WokrspaceHeader } from "./_components/workspace-header";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(orpc.workspace.list.queryOptions()),
    queryClient.prefetchQuery(
      orpc.channel.list.queryOptions({ input: { organizationId: workspaceId } })
    ),
  ]);
  return (
    <SidebarProvider>
      <HydrateClient client={queryClient}>
        <AppSidebar organizationId={workspaceId} />
      </HydrateClient>
      <SidebarInset className="h-screen flex flex-col overflow-hidden">
        <WokrspaceHeader />
        <main className="flex flex-1 flex-col min-h-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
