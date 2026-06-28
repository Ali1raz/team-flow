import { WorkspaceHeader } from "../(workspace)/workspaces/_components/header";

export default function ProfileLayout(props: LayoutProps<"/profile">) {
  const { children } = props;
  return (
    <main className="w-full">
      <WorkspaceHeader />
      <div className="max-w-6xl mx-auto">{children}</div>
    </main>
  );
}
