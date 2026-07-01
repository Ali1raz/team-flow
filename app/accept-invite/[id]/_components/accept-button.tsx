"use client";

import { Button } from "@/components/ui/button";
import { useConfetti } from "@/hooks/use-confetti";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AcceptButton({ id }: { id: string }) {
  const router = useRouter();
  const { triggerConfetti } = useConfetti();

  const queryClient = useQueryClient();

  async function accept() {
    const { data, error } = await authClient.organization.acceptInvitation({
      invitationId: id,
    });

    if (error) {
      toast.error(error.message);
      return;
    }
    triggerConfetti();
    queryClient.invalidateQueries({
      queryKey: orpc.workspace.invitations.list.queryKey({
        input: { workspaceId: data.invitation.organizationId },
      }),
    });
    toast.success(
      "Invitation accepted, you are now a member in the workspace!"
    );
    router.push(`/workspaces/${data.invitation.organizationId}`);
  }

  return <Button onClick={accept}>Accept</Button>;
}
