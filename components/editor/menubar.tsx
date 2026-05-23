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
              pressed={editorState?.isBold ?? false}
              onPressedChange={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold />
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
              pressed={editorState?.isItalic ?? false}
              onPressedChange={() =>
                editor?.chain().focus().toggleItalic().run()
              }
            >
              <Italic />
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
              pressed={editorState?.isStrike ?? false}
              onPressedChange={() =>
                editor?.chain().focus().toggleStrike().run()
              }
            >
              <Strikethrough />
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
              pressed={editorState?.CodeBlockLowlight ?? false}
              onPressedChange={() =>
                editor?.chain().focus().toggleCodeBlock().run()
              }
            >
              <Code />
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
              pressed={editorState?.bulletList ?? false}
              onPressedChange={() =>
                editor?.chain().focus().toggleBulletList().run()
              }
            >
              <List />
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
              pressed={editorState?.orderedList ?? false}
              onPressedChange={() =>
                editor?.chain().focus().toggleOrderedList().run()
              }
            >
              <ListOrdered />
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
            >
              <Undo2 />
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
              disabled={!editorState?.canRedo}
              onClick={() => editor?.chain().focus().redo().run()}
            >
              <Redo2 />
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
