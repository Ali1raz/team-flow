import type { Metadata } from "next";
import { client } from "@/lib/orpc";
import { TeamList } from "./_components/team-list";

export async function generateMetadata(
  props: PageProps<"/organizations/[organizationId]">
): Promise<Metadata> {
  const { params } = props;
  const { organizationId } = await params;
  const { organizations } = await client.organization.list();
  const organization = organizations.find((w) => w.id === organizationId);

  return {
    title: organization?.name ?? "Organization",
  };
}

export default async function Page(
  props: PageProps<"/organizations/[organizationId]">
) {
  const { params } = props;
  const { organizationId } = await params;

  return <TeamList organizationId={organizationId} />;
}
