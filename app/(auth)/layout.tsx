import { SITE } from "@/lib/app/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE.name}`,
    default: SITE.name,
  },
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
