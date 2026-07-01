import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export default async function WorkspaceIdInvitationLayout(
  props: LayoutProps<"/workspaces/[workspaceId]/invitations">
) {
  const { children, params } = props;

  const { workspaceId } = await params;
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(
    orpc.workspace.invitations.list.queryOptions({ input: { workspaceId } })
  );

  return (
    <main>
      <HydrateClient client={queryClient}>{children}</HydrateClient>
    </main>
  );
}
