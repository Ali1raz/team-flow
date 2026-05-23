import { Editor } from "@tiptap/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useEditorState } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

interface iAppProps {
  editor: Editor | null;
}

export function Menubar({ editor }: iAppProps) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) {
        return null;
      }
      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isStrike: editor.isActive("strike"),
        CodeBlockLowlight: editor.isActive("codeBlock"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        canUndo: editor.can().chain().focus().undo().run(),
        canRedo: editor.can().chain().focus().redo().run(),
      };
    },
  });

  return (
    <div className="flex w-full flex-wrap items-center gap-1 sm:p-2 bg-card border-input border-b rounded-t-md p-2">
      <div className="flex gap-1 items-center flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isBold}
              onPressedChange={() => editor?.chain().focus().toggleBold().run()}
              className={cn(
                editorState?.isBold && "bg-muted text-muted-foreground"
              )}
            >
              <Bold className="size-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bold</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isItalic}
              onPressedChange={() =>
                editor?.chain().focus().toggleItalic().run()
              }
              className={cn(
                editorState?.isItalic && "bg-muted text-muted-foreground"
              )}
            >
              <Italic className="size-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>Italic</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isStrike}
              onPressedChange={() =>
                editor?.chain().focus().toggleStrike().run()
              }
              className={cn(
                editorState?.isStrike && "bg-muted text-muted-foreground"
              )}
            >
              <Strikethrough className="size-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>Strike</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.CodeBlockLowlight}
              onPressedChange={() =>
                editor?.chain().focus().toggleCodeBlock().run()
              }
              className={cn(
                editorState?.CodeBlockLowlight &&
                  "bg-muted text-muted-foreground"
              )}
            >
              <Code className="size-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>Code Block</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator
        orientation="vertical"
        className="data-vertical:h-4 data-vertical:self-auto"
      />

      <div className="flex gap-1 items-center flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.bulletList}
              onPressedChange={() =>
                editor?.chain().focus().toggleBulletList().run()
              }
              className={cn(
                editorState?.bulletList && "bg-muted text-muted-foreground"
              )}
            >
              <List className="size-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bullet List</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.orderedList}
              onPressedChange={() =>
                editor?.chain().focus().toggleOrderedList().run()
              }
              className={cn(
                editorState?.orderedList && "bg-muted text-muted-foreground"
              )}
            >
              <ListOrdered className="size-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ordered List</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator
        orientation="vertical"
        className="data-vertical:h-4 data-vertical:self-auto"
      />
      <div className="flex gap-1 items-center flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              disabled={!editorState?.canUndo}
              onClick={() => editor?.chain().focus().undo().run()}
              className={cn(
                editorState?.canUndo && "bg-muted text-muted-foreground"
              )}
            >
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editorState?.canRedo}
              className={cn(
                editorState?.canRedo && "bg-muted text-muted-foreground"
              )}
            >
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
