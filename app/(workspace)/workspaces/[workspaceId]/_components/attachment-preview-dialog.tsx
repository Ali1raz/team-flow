"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { ImageUploadDialog } from "./image-dialog";

interface iAppProps {
  url: string;
  onDelete: () => void;
  onChangeComplete: (newUrl: string) => void;
  children: ReactNode;
}

export function AttachmentPreviewDialog({
  url,
  onDelete,
  onChangeComplete,
  children,
}: iAppProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Attachment Preview</DialogTitle>
          <DialogDescription>
            Preview the attached file or change/delete it before sending the
            message.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-75 overflow-hidden rounded-lg bg-muted">
          {/* Keep the preview contained so large uploads do not overflow the dialog. */}
          <Image
            src={url}
            alt="attachment preview"
            fill
            className="object-contain"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogClose>
          <ImageUploadDialog
            onUploadComplete={(newUrl) => {
              onChangeComplete(newUrl);
              setOpen(false);
            }}
          >
            <Button type="button" variant="outline">
              Change
            </Button>
          </ImageUploadDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
