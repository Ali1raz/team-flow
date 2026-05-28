"use client";

import { ComponentProps, CSSProperties, Suspense } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebarWithSide,
} from "@/components/ui/sidebar";
import { ThreadsForm } from "./threads-form";
import { useThread } from "./thread-context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import Image from "next/image";
import { formatLocalDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserImage } from "../general/user-avatar";
import { RenderJSONtoHTML } from "../editor/render-content";
import { SummarizeThreadPopover } from "./summarize-thread-popover";

// Empty state shown when no thread is selected or the thread has no replies yet.
function EmptyState() {
  return (
    <p className="text-sm text-muted-foreground p-4 text-center">
      Select a message to view replies.
    </p>
  );
}

export function RightSidebar({
  width = "24rem",
  ...props
}: ComponentProps<typeof Sidebar> & { width?: string }) {
  const { threadId } = useThread();
  const { setOpen } = useSidebarWithSide("right");

  const { data, isLoading } = useQuery({
    ...orpc.message.threads.list.queryOptions({
      input: { threadId: threadId ?? "" },
    }),
    enabled: !!threadId,
  });

  return (
    <Sidebar
      {...props}
      style={{ "--sidebar-width": width } as CSSProperties}
      className="h-screen"
    >
      <SidebarHeader className="p-4 h-16">
        <SidebarRail />
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Replies</h1>
          <div className="flex items-center gap-2">
            <SummarizeThreadPopover threadId={threadId!} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Close threads</span>
            </Button>
          </div>
        </div>
      </SidebarHeader>

      {/* Single scrollable area so parent message and replies scroll together */}
      <SidebarContent className="overflow-y-auto">
        <div className="flex flex-col gap-4 p-2">
          {!threadId && <EmptyState />}

          {threadId && isLoading && (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Loading…
            </p>
          )}

          {threadId && data && (
            <>
              <Card>
                <CardContent>
                  <div className="flex items-start gap-2">
                    <UserImage
                      image={data.parent.user.image}
                      className="size-8 rounded-full object-cover object-center"
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <p className="text-sm font-medium max-w-[12ch] truncate">
                          {data.parent.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatLocalDateTime(data.parent.createdAt)}
                        </p>
                      </div>
                      <RenderJSONtoHTML
                        content={JSON.parse(data.parent.content)}
                        className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
                      />

                      {data.parent.imageUrl && (
                        <div>
                          <Image
                            src={data.parent.imageUrl}
                            alt="uploaded image"
                            width={512}
                            height={512}
                            className="object-cover rounded max-h-75 w-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              <div className="text-sm text-muted-foreground">
                {data.threads.length}{" "}
                {data.threads.length === 1 ? "reply" : "replies"}
              </div>

              {data.threads.map((thread) => (
                <Card key={thread.id}>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <UserImage
                        image={thread.user.image}
                        name={thread.user.name}
                        className="size-8 rounded-full object-cover object-center"
                      />
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <p className="text-sm font-medium max-w-[12ch] truncate">
                            {thread.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatLocalDateTime(thread.createdAt)}
                          </p>
                        </div>
                        <RenderJSONtoHTML
                          content={JSON.parse(thread.content)}
                          className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
                        />

                        {thread.imageUrl && (
                          <div>
                            <Image
                              src={thread.imageUrl}
                              alt="uploaded image"
                              width={512}
                              height={512}
                              className="object-cover rounded max-h-75 w-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t px-2 shrink-0">
        {threadId ? (
          <Suspense fallback={null}>
            <ThreadsForm key={threadId} threadId={threadId} />
          </Suspense>
        ) : (
          <EmptyState />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
