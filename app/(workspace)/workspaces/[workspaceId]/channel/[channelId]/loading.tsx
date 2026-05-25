import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <Empty className="h-full bg-muted/40">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-muted rounded-full size-12">
          <Loader2 className="size-8 animate-spin" />
        </EmptyMedia>
        <EmptyTitle className="text-4xl mt-4">Please wait</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          Please wait while we load the channel.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
