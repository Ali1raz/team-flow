import { orpc } from "@/lib/orpc";
import { getQueryClient } from "@/lib/query/hydration";

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
