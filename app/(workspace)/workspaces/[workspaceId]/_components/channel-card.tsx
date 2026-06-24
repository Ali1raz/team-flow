"use client";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { channelType } from "@/components/update-channel-dialog";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export function ChannelCard({
  channel,
  workspaceId,
}: {
  channel: channelType;
  workspaceId: string;
}) {
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

      <CardContent className="relative">
        <div className="absolute bottom-0 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DeleteChannelDialog channel={channel}>
                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  variant="destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DeleteChannelDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
