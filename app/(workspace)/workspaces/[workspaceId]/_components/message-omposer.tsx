import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";
import { ImageUploadDialog } from "./image-dialog";
import { AttachmentChip } from "./attachment-chip";

interface iAppProps {
  field: {
    value: string;
    onChange: (value: string) => void;
  };
  imageUrl: string | null | undefined;
  onImageChange: (url: string | undefined) => void;
  onClearImage?: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function Messagecomponser({
  field,
  imageUrl,
  onImageChange,
  onClearImage,
  onSubmit,
  isSubmitting,
  submitLabel = "Send",
}: iAppProps) {
  return (
    <Editor
      field={{ value: field.value, onChange: field.onChange }}
      sendButton={
        <Button
          disabled={isSubmitting}
          type="button"
          size="sm"
          onClick={onSubmit}
        >
          <Send data-icon="inline-start" /> {submitLabel}
        </Button>
      }
      footerLeft={
        imageUrl ? (
          <AttachmentChip
            url={imageUrl}
            onDelete={() =>
              onClearImage ? onClearImage() : onImageChange(undefined)
            }
            onChangeComplete={(url) => onImageChange(url)}
          />
        ) : (
          <ImageUploadDialog onUploadComplete={(url) => onImageChange(url)}>
            <Button size="sm" variant="outline" type="button">
              <ImageIcon data-icon="inline-start" /> Attach
            </Button>
          </ImageUploadDialog>
        )
      }
    />
  );
}
