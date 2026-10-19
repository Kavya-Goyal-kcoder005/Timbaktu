import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = '',
  onChange,
  placeholder = 'Every story has a voice... start writing your tale here...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-forest-700 underline underline-offset-2',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'timbaktu-prose focus:outline-none min-h-[300px] p-4 text-bark-900',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if changed externally (e.g. edit post initial load)
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return <div className="h-64 flex items-center justify-center text-bark-400">Loading editor...</div>;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const toolBtn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-forest-700 text-parchment-50'
          : 'text-bark-600 hover:text-bark-900 hover:bg-parchment-200'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="w-full bg-parchment-50 border border-sage-300 rounded-2xl overflow-hidden shadow-sm text-left">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-parchment-200/70 border-b border-sage-300 select-none">
        {toolBtn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold className="w-4 h-4" />, 'Bold')}
        {toolBtn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <Italic className="w-4 h-4" />, 'Italic')}

        <div className="w-px h-5 bg-sage-300 mx-1" />

        {toolBtn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 className="w-4 h-4" />, 'Heading 1')}
        {toolBtn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 className="w-4 h-4" />, 'Heading 2')}
        {toolBtn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 className="w-4 h-4" />, 'Heading 3')}

        <div className="w-px h-5 bg-sage-300 mx-1" />

        {toolBtn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List className="w-4 h-4" />, 'Bullet List')}
        {toolBtn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="w-4 h-4" />, 'Numbered List')}
        {toolBtn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="w-4 h-4" />, 'Blockquote')}

        <div className="w-px h-5 bg-sage-300 mx-1" />

        {toolBtn(editor.isActive('link'), setLink, <LinkIcon className="w-4 h-4" />, 'Insert Link')}

        <div className="w-px h-5 bg-sage-300 mx-1 ml-auto" />

        {toolBtn(false, () => editor.chain().focus().undo().run(), <Undo className="w-4 h-4" />, 'Undo')}
        {toolBtn(false, () => editor.chain().focus().redo().run(), <Redo className="w-4 h-4" />, 'Redo')}
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
};
