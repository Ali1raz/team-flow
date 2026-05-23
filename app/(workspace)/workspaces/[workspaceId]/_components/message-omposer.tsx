import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";

interface iAppProps {
  field: {
    value: string;
    onChange: (value: string) => void;
  };
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function Messagecomponser({ field, onSubmit, isSubmitting }: iAppProps) {
  return (
    <Editor
      field={{ value: field.value, onChange: field.onChange }}
      sendButton={
        <Button disabled={isSubmitting} size="sm" onClick={onSubmit}>
          <Send className="size-4" /> Send
        </Button>
      }
      footerLeft={
        <Button size="sm" variant="outline">
          <ImageIcon className="size-4" /> Attach
        </Button>
      }
    />
  );
}
