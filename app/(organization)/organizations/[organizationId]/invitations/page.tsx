import { Metadata } from "next";
import { InvitationList } from "./_components/invitation-table";

export const metadata: Metadata = {
  title: "Invitations",
  description: "Manage invitations for this organization",
};

export default async function InvitationsPage(
  props: PageProps<"/organizations/[organizationId]/invitations">
) {
  const { params } = props;
  const { organizationId } = await params;

  return (
    <div className="p-4 sm:px-6 w-full max-w-6xl space-x-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">Invitations</h1>
        <p className="text-sm text-muted-foreground">
          Manage invitations for this organization
        </p>
      </div>

      <InvitationList organizationId={organizationId} />
    </div>
  );
}
