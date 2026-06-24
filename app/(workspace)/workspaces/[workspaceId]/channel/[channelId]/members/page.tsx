"use client";

import { UserImage } from "@/components/general/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/lib/orpc";
import { MoreHorizontal } from "lucide-react";
import { RemoveMemberDialog } from "./_components/remov-member-dialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AddMemberToChannel } from "@/components/add-member-to-channel";

export default function ChannelMembersPage() {
  const { channelId, workspaceId } = useParams<{
    channelId: string;
    workspaceId: string;
  }>();

  const {
    data: { members },
  } = useSuspenseQuery(
    orpc.channel.members.list.queryOptions({ input: { channelId } })
  );

  return (
    <div className="p-4 sm:px-6 sm:max-w-xl w-full space-x-2">
      <div className="flex sm:items-baseline gap-2 sm:justify-between flex-col sm:flex-row">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage members in this channel
          </p>
        </div>
        <AddMemberToChannel channelId={channelId} organizationId={workspaceId}>
          <Button className="w-fit">Add Member</Button>
        </AddMemberToChannel>
      </div>

      <div className="space-y-3 mt-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader className="flex flex-row items-center gap-2 w-full">
              <UserImage image={member.image} name={member.name} />
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center justify-between">
                  <span>{member.name}</span>
                  <Badge variant="ghost">{member.role}</Badge>
                </CardTitle>
                <CardDescription>{member.email}</CardDescription>
              </div>

              <CardAction>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <RemoveMemberDialog
                      channelId={channelId}
                      organizationId={workspaceId}
                      memberId={member.id}
                      memberName={member.name}
                    >
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        variant="destructive"
                      >
                        Remove
                      </DropdownMenuItem>
                    </RemoveMemberDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
