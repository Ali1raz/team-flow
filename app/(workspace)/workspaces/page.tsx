import { WorkspaceHeader } from "./_components/header";
import { CreateWorkspaceDialog } from "./_components/create-workspace-dialog";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { WorkspaceList } from "./_components/workspace-list";
import { orpc } from "@/lib/orpc";

export default async function Workspaces() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(orpc.workspace.list.queryOptions());

  return (
    <div className="h-screen bg-muted/20 w-full">
      <WorkspaceHeader />
      <div className="max-w-6xl mx-auto px-4 py-8 mt-6 pt-16 space-y-4">
        <div className="flex sm:justify-between max-sm:items-start items-center sm:flex-row flex-col gap-3">
          <h1 className="text-2xl md:text-4xl font-bold">Workspaces</h1>
          <CreateWorkspaceDialog />
        </div>

        <HydrateClient client={queryClient}>
          <WorkspaceList />
        </HydrateClient>
      </div>
    </div>
  );
}
