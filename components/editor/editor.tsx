"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { baseExtensions } from "./extensions";
import { Menubar } from "./menubar";

export function Editor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: baseExtensions,
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[125px] focus:outline-none prose prose-sm sm:prose lg:prose-lg marker:text-primary dark:prose-invert",
      },
    },
  });

  return (
    <div className="relative w-full border border-input rounded-md overflow-hidden dark:bg-input/30 flex flex-col">
      <Menubar editor={editor} />
      <EditorContent editor={editor} className="p-4 max-h-50 overflow-y-auto" />
    </div>
  );
}
