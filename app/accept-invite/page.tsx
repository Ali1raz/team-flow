import type { Metadata } from "next";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Accept Invite",
  robots: { index: false, follow: false },
};

export default function AcceptInvitePage() {
  return (
    <div className="h-screen w-full bg-muted/40 flex items-center justify-center">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle>Need Invitation Id</CardTitle>
          <CardDescription>
            No invitation id provided, you need to be invited to join an
            organization to see this page.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
