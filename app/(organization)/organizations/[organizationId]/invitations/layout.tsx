import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export default async function OrganizationIdInvitationLayout(
  props: LayoutProps<"/organizations/[organizationId]/invitations">
) {
  const { children, params } = props;

  const { organizationId } = await params;
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(
    orpc.organization.invitations.list.queryOptions({
      input: { organizationId },
    })
  );

  return (
    <main>
      <HydrateClient client={queryClient}>{children}</HydrateClient>
    </main>
  );
}
