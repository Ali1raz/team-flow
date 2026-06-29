import { Metadata } from "next";
import { WorkspaceHeader } from "../(workspace)/workspaces/_components/header";
import { SITE } from "@/lib/app/site";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE.name}`,
    default: SITE.name,
  },
};

export default function ProfileLayout(props: LayoutProps<"/profile">) {
  const { children } = props;
  return (
    <main className="w-full">
      <WorkspaceHeader />
      <div className="max-w-6xl mx-auto">{children}</div>
    </main>
  );
}
