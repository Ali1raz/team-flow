"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RejectButton({ id }: { id: string }) {
  const router = useRouter();

  async function reject() {
    const { error } = await authClient.organization.rejectInvitation({
      invitationId: id,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Invitation rejected successfully!");
    router.push("/");
  }

  return (
    <Button variant="destructive" onClick={reject}>
      Reject
    </Button>
  );
}
