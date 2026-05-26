"use client";

import { useQuery } from "@tanstack/react-query";
import { AcceptButton } from "./_components/accept-button";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Logo from "@/public/team-flow.png";
import Image from "next/image";
import Link from "next/link";
import { formatLocalDateTime } from "@/lib/utils";
import Error from "@/app/error";
import { Loader2 } from "lucide-react";
import { RejectButton } from "./_components/reject-button";

export default function AcceptInvitePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery(
    orpc.invitation.get.queryOptions({ input: { invitationId: id } })
  );

  const inv = data?.invitation;

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-muted/30 w-full">
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin size-8" />
        </div>
      </div>
    );

  if (error) return <Error error={error} />;

  if (!inv) return notFound();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image
            src={Logo}
            alt="TeamFlow Logo"
            width={40}
            height={40}
            className="object-cover"
          />
          <p className="text-primary">TeamFlow</p>
        </Link>
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-2xl font-bold">
              You&apos;re invited!
            </CardTitle>
            <CardDescription className="max-w-md mx-auto">
              <p>
                <span className="text-primary font-medium">
                  {inv.inviterEmail}
                </span>{" "}
                has invited you to join{" "}
                <span className="font-medium text-primary underline underline-offset-4">
                  {inv.organizationName}
                </span>{" "}
                in TeamFlow.
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Organization</span>
                <span className="font-medium">{inv.organizationName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your email</span>
                <span className="font-medium">{inv.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge
                  variant={
                    inv.role === "owner"
                      ? "default"
                      : inv.role === "admin"
                        ? "outline"
                        : "ghost"
                  }
                >
                  {inv.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-medium">
                  {formatLocalDateTime(inv.expiresAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <AcceptButton id={id} />
              <RejectButton id={id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
