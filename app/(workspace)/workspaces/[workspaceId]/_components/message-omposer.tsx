import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";

interface iAppProps {
  field: {
    value: string;
    onChange: (value: string) => void;
  };
}

export function Messagecomponser({ field }: iAppProps) {
  return (
    <Editor
      field={{ value: field.value, onChange: field.onChange }}
      sendButton={
        <Button size="sm">
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
