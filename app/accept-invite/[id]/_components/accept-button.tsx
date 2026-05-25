"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AcceptButton({ id }: { id: string }) {
  const router = useRouter();

  async function accept() {
    const { data, error } = await authClient.organization.acceptInvitation({
      invitationId: id,
    });

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      "Invitation accepted, you are now a member in the workspace!"
    );
    router.push(`/workspaces/${data.invitation.organizationId}`);
  }

  return <Button onClick={accept}>Accept</Button>;
}
