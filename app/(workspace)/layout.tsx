import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  await Promise.all([queryClient.prefetchQuery(orpc.user.get.queryOptions())]);
  return (
    <main>
      <HydrateClient client={queryClient}>{children}</HydrateClient>
    </main>
  );
}
