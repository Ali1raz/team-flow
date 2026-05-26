"use client";

import { Editor, useEditorState } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react";
// BubbleMenu React component lives in the /menus sub-path, separate from the Tiptap extension
import { BubbleMenu } from "@tiptap/react/menus";

interface iAppProps {
  editor: Editor | null;
}

export function EditorBubbleMenu({ editor }: iAppProps) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isStrike: editor.isActive("strike"),
        isCode: editor.isActive("codeBlock"),
        isBlockquote: editor.isActive("blockquote"),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
      };
    },
  });

  // Nothing to render without an editor instance
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }: { state: { selection: { empty: boolean } } }) => {
        if (typeof window !== "undefined" && window.innerWidth >= 640) {
          return false;
        }
        return !state.selection.empty;
      }}
      options={{
        placement: "top",
      }}
    >
      <div className="flex items-center gap-0.5 rounded-lg border border-input bg-popover shadow-md p-1">
        {/* Inline formatting group */}
        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editorState?.isBold ?? false}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editorState?.isItalic ?? false}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editorState?.isStrike ?? false}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editorState?.isCode ?? false}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-3.5 w-3.5" />
        </Toggle>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Block formatting group */}
        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editorState?.isBulletList ?? false}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editorState?.isOrderedList ?? false}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={editorState?.isBlockquote ?? false}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
        >
          <Quote className="h-3.5 w-3.5" />
        </Toggle>
      </div>
    </BubbleMenu>
  );
}
