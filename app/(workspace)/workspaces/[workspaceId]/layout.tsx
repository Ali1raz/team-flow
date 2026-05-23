import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { ReactNode } from "react";
import { WokrspaceHeader } from "./_components/workspace-header";

export default async function Layout({
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
      <SidebarInset>
        <WokrspaceHeader />
        <main className="flex flex-1 h-screen flex-col gap-4 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
