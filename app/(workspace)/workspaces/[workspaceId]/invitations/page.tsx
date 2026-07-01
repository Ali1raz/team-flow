import { InvitationList } from "./_components/invitation-table";

export default async function InvitationsPage(
  props: PageProps<"/workspaces/[workspaceId]/invitations">
) {
  const { params } = props;
  const { workspaceId } = await params;

  return (
    <div className="p-4 sm:px-6 w-full max-w-6xl space-x-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">Invitations</h1>
        <p className="text-sm text-muted-foreground">
          Manage invitations for this workspace
        </p>
      </div>

      <InvitationList workspaceId={workspaceId} />
    </div>
  );
}
