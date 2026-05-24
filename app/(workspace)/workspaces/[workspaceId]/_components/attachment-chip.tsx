"use client";

import { Eye } from "lucide-react";
import Image from "next/image";
import { AttachmentPreviewDialog } from "./attachment-preview-dialog";

interface iAppPops {
  url: string;
  onDelete: () => void;
  onChangeComplete: (newUrl: string) => void;
}

export function AttachmentChip({ url, onDelete, onChangeComplete }: iAppPops) {
  return (
    <AttachmentPreviewDialog
      url={url}
      onDelete={onDelete}
      onChangeComplete={onChangeComplete}
    >
      <div className="group relative size-12 overflow-hidden rounded bg-muted">
        {/* The overlay hints that the chip opens a preview dialog instead of acting like a plain thumbnail. */}
        <Image src={url} alt="uploaded image" fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Eye className="size-4 text-foreground" />
        </div>
      </div>
    </AttachmentPreviewDialog>
  );
}
