"use client";

import { Button } from "@/components/ui/button";
import { useConfetti } from "@/hooks/use-confetti";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AcceptButton({ id }: { id: string }) {
  const router = useRouter();
  const { triggerConfetti } = useConfetti();

  async function accept() {
    const { data, error } = await authClient.organization.acceptInvitation({
      invitationId: id,
    });

    if (error) {
      toast.error(error.message);
      return;
    }
    triggerConfetti();
    toast.success(
      "Invitation accepted, you are now a member in the workspace!"
    );
    router.push(`/workspaces/${data.invitation.organizationId}`);
  }

  return <Button onClick={accept}>Accept</Button>;
}
