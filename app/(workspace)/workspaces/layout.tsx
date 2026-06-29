import { SITE } from "@/lib/app/site";
import { orpc } from "@/lib/orpc";
import { getQueryClient } from "@/lib/query/hydration";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE.name}`,
    default: SITE.name,
  },
};

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(orpc.workspace.members.list.queryOptions()),
  ]);

  return <main>{children}</main>;
}
