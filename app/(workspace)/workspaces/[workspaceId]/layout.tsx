import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { ReactNode } from "react";
import { WokrspaceHeader } from "./_components/workspace-header";
import { ThreadProvider } from "@/components/thread-sidebar/thread-context";
import { RightSidebar } from "@/components/thread-sidebar/right-sidebar";

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
    queryClient.prefetchQuery(orpc.workspace.members.list.queryOptions()),
  ]);
  return (
    <SidebarProvider defaultOpenRight={false}>
      <ThreadProvider>
        <HydrateClient client={queryClient}>
          <AppSidebar organizationId={workspaceId} />
        </HydrateClient>
        <SidebarInset className="h-screen flex flex-col overflow-hidden">
          <HydrateClient client={queryClient}>
            <WokrspaceHeader />
          </HydrateClient>
          <main className="overflow-scroll flex flex-1 flex-col min-h-0">
            {children}
          </main>
        </SidebarInset>
        <RightSidebar collapsible="offcanvas" variant="sidebar" side="right" />
      </ThreadProvider>
    </SidebarProvider>
  );
}
