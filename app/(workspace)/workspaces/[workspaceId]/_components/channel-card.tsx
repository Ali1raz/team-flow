"use client";

import { AddMemberToChannel } from "@/components/add-member-to-channel";
import { DeleteChannelDialog } from "@/components/delete-channel-dailog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  channelType,
  UpdateChannelDialog,
} from "@/components/update-channel-dialog";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export function ChannelCard({
  channel,
  workspaceId,
}: {
  channel: channelType;
  workspaceId: string;
}) {
  const { data: user } = useQuery(orpc.user.get.queryOptions());

  return (
    <Card className="group w-full outline-2 outline-transparent hover:outline-primary outline-offset-4 rounded-xl">
      <CardHeader>
        <CardTitle>
          <Link
            href={`/workspaces/${workspaceId}/channel/${channel.id}`}
            className="hover:underline"
          >
            {channel.name}
          </Link>
        </CardTitle>
        <CardDescription>
          <Link
            href={`/workspaces/${workspaceId}/channel/${channel.id}/members`}
            className="hover:underline underline-offset-4"
          >
            Total members: {channel.totalMembers}
          </Link>
        </CardDescription>
      </CardHeader>

      {user && user.role !== "member" && (
        <CardContent className="relative">
          <div className="absolute bottom-0 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <UpdateChannelDialog channel={channel}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Edit
                  </DropdownMenuItem>
                </UpdateChannelDialog>
                <AddMemberToChannel
                  organizationId={workspaceId}
                  channelId={channel.id}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Add Member
                  </DropdownMenuItem>
                </AddMemberToChannel>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/workspaces/${workspaceId}/channel/${channel.id}/members`}
                  >
                    Manage Members
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DeleteChannelDialog channel={channel}>
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    variant="destructive"
                  >
                    Delete channel
                  </DropdownMenuItem>
                </DeleteChannelDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
