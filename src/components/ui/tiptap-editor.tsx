import { useEffect } from "react";
import { RichTextProvider } from "reactjs-tiptap-editor";

// Base Kit
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { ListItem } from "@tiptap/extension-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Dropcursor,
  Gapcursor,
  Placeholder,
  TrailingNode,
} from "@tiptap/extensions";

import { Video } from "reactjs-tiptap-editor/video";
import { Callout, RichTextCallout } from "reactjs-tiptap-editor/callout";

// Slash Command
import { SlashCommand, SlashCommandList } from "reactjs-tiptap-editor/slashcommand";

// Bubble
import {
  RichTextBubbleLink,
  RichTextBubbleImage,
  RichTextBubbleVideo,
  RichTextBubbleImageGif,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBubbleCallout,
  RichTextBubbleCodeBlock,
  RichTextBubbleMenuDragHandle,
} from "reactjs-tiptap-editor/bubble";

// Explicit imports for restored items
import { Blockquote, RichTextBlockquote } from "reactjs-tiptap-editor/blockquote";
import { Bold, RichTextBold } from "reactjs-tiptap-editor/bold";
import { BulletList, RichTextBulletList } from "reactjs-tiptap-editor/bulletlist";
import { Clear, RichTextClear } from "reactjs-tiptap-editor/clear";
import { Code, RichTextCode } from "reactjs-tiptap-editor/code";
import { CodeBlock, RichTextCodeBlock } from "reactjs-tiptap-editor/codeblock";
import { CodeView } from "reactjs-tiptap-editor/codeview";
import { Color, RichTextColor } from "reactjs-tiptap-editor/color";
import { Column, ColumnNode, MultipleColumnNode, RichTextColumn } from "reactjs-tiptap-editor/column";
import { Emoji, RichTextEmoji } from "reactjs-tiptap-editor/emoji";
import { ExportPdf, RichTextExportPdf } from "reactjs-tiptap-editor/exportpdf";
import { ExportWord, RichTextExportWord } from "reactjs-tiptap-editor/exportword";
import { FontFamily, RichTextFontFamily } from "reactjs-tiptap-editor/fontfamily";
import { FontSize, RichTextFontSize } from "reactjs-tiptap-editor/fontsize";
import { Heading, RichTextHeading } from "reactjs-tiptap-editor/heading";
import { Highlight, RichTextHighlight } from "reactjs-tiptap-editor/highlight";
import { History, RichTextRedo, RichTextUndo } from "reactjs-tiptap-editor/history";
import { HorizontalRule, RichTextHorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { Image, RichTextImage } from "reactjs-tiptap-editor/image";
import { ImageGif } from "reactjs-tiptap-editor/imagegif";
import { ImportWord, RichTextImportWord } from "reactjs-tiptap-editor/importword";
import { Indent, RichTextIndent } from "reactjs-tiptap-editor/indent";
import { Italic, RichTextItalic } from "reactjs-tiptap-editor/italic";
import { LineHeight, RichTextLineHeight } from "reactjs-tiptap-editor/lineheight";
import { Link, RichTextLink } from "reactjs-tiptap-editor/link";
import { MoreMark } from "reactjs-tiptap-editor/moremark";
import { OrderedList, RichTextOrderedList } from "reactjs-tiptap-editor/orderedlist";
import { RichTextSearchAndReplace, SearchAndReplace } from "reactjs-tiptap-editor/searchandreplace";
import { RichTextStrike, Strike } from "reactjs-tiptap-editor/strike";
import { RichTextTable, Table } from "reactjs-tiptap-editor/table";
import { RichTextTaskList, TaskList } from "reactjs-tiptap-editor/tasklist";
import { RichTextAlign, TextAlign } from "reactjs-tiptap-editor/textalign";
import { RichTextUnderline, TextUnderline } from "reactjs-tiptap-editor/textunderline";

import { createLowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import bash from "highlight.js/lib/languages/bash";

import "reactjs-tiptap-editor/style.css";
import { EditorContent, useEditor } from "@tiptap/react";
import { CharacterCount } from "@tiptap/extensions";
import { cn } from "../../lib/utils";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Link as RouterLink } from "react-router";
import { Button } from "./button";
import { EMOJI_LIST } from "../../lib/emojis";

const lowlight = createLowlight();
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);
lowlight.register("bash", bash);

const DocumentColumn = Document.extend({
  content: "(block|columns)+",
});

const BaseKit = [
  DocumentColumn,
  Text,
  Dropcursor.configure({
    class: "reactjs-tiptap-editor-theme",
    color: "#0f172a",
    width: 2,
  }),
  Gapcursor,
  HardBreak,
  Paragraph,
  TrailingNode,
  ListItem,
  TextStyle,
];

type TiptapEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  onSave?: () => void;
  saveLabel?: string;
  saving?: boolean;
  saveDisabled?: boolean;
  backUrl?: string;
  backLabel?: string;
  label?: string;
  fullScreen?: boolean;
};

export function TiptapEditor({
  value,
  onChange,
  placeholder,
  className,
  readOnly = false,
  onImageUpload,
  onSave,
  saveLabel = "Save",
  saving = false,
  saveDisabled = false,
  backUrl,
  backLabel = "Back",
  label,
  fullScreen = true,
}: TiptapEditorProps) {
  const extensions = [
    ...BaseKit,
    Placeholder.configure({
      placeholder: placeholder || "Press '/' for commands...",
    }),
    CharacterCount.configure({
      limit: 50000,
    }),
    History,
    SearchAndReplace,
    Clear,
    FontFamily,
    Heading.configure({ levels: [1, 2, 3] }),
    FontSize,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    MoreMark,
    Emoji.configure({
      suggestion: {
        items: async ({ query }: any) => {
          const lowerCaseQuery = query?.toLowerCase();
          return EMOJI_LIST.filter(({ name }) =>
            name.toLowerCase().includes(lowerCaseQuery),
          ).slice(0, 20);
        },
      },
    }),
    Color,
    Highlight,
    BulletList,
    OrderedList,
    TextAlign,
    Indent,
    LineHeight,
    TaskList,
    Link,
    Image.configure({
      upload: async (file: File) => {
        if (onImageUpload) {
          return await onImageUpload(file);
        }
        return URL.createObjectURL(file);
      },
    }),
    Video.configure({
      upload: async (file: File) => {
        return URL.createObjectURL(file);
      },
    }),
    ImageGif,
    Blockquote,
    HorizontalRule,
    Code,
    CodeBlock.configure({
      lowlight,
    }),
    Column,
    ColumnNode,
    MultipleColumnNode,
    Table,
    ExportPdf,
    ImportWord,
    ExportWord,
    SlashCommand,
    CodeView,
    Callout,
  ];

  const editor = useEditor({
    editable: !readOnly,
    content: value || "",
    extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap prose prose-lg max-w-none focus:outline-none min-h-[300px] px-4 md:px-12 py-12 text-[18px] leading-[1.8] font-serif",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  if (!editor) return null;

  const editorContainer = (
    <RichTextProvider editor={editor}>
      <div className={cn(
        fullScreen ? "fixed inset-0 z-50 flex flex-col bg-white overflow-hidden" : "flex flex-col border rounded-md bg-white overflow-hidden", 
        className
      )}>
        {/* Integrated Header / Menu Area */}
        <div className="flex border-b border-slate-200 bg-[#F9FAFB] px-4 h-14 items-center justify-between sticky top-0 z-[60]">
          <div className="flex items-center gap-4 flex-1">
            {backUrl && (
              <RouterLink to={backUrl} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mr-2">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </RouterLink>
            )}
            
            {backUrl && <div className="h-4 w-px bg-slate-200" />}
            
            {label && (
               <div className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200 uppercase tracking-tight">
                 {label}
               </div>
             )}

             {label && <div className="h-4 w-px bg-slate-200" />}
            
            {/* Main Toolbar integrated here if space allows, or use separate row */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              <RichTextUndo />
              <RichTextRedo />
              <div className="h-4 w-px bg-slate-200 mx-0.5" />
              <RichTextBold />
              <RichTextItalic />
              <RichTextUnderline />
              <RichTextStrike />
              <div className="h-4 w-px bg-slate-200 mx-0.5" />
              <RichTextHeading />
              <RichTextBulletList />
              <RichTextOrderedList />
              <div className="h-4 w-px bg-slate-200 mx-0.5" />
              <RichTextImage />
              <RichTextTable />
              <RichTextLink />
            </div>
          </div>

          {onSave && (
            <div className="flex items-center gap-3 pl-4">
              <Button
                size="sm"
                disabled={readOnly || saving || saveDisabled}
                onClick={onSave}
                className="h-8 rounded-md bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                {saving ? "Publishing..." : saveLabel}
              </Button>
            </div>
          )}
        </div>

        {/* Main Toolbar (Secondary Row for all features like demo) */}
        <div className="border-b border-slate-100 bg-white px-4 py-1.5 overflow-x-auto no-scrollbar shadow-sm">
          <div className="flex items-center gap-1 flex-wrap">
            <RichTextFontFamily />
            <RichTextFontSize />
            <RichTextColor />
            <RichTextHighlight />
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <RichTextAlign />
            <RichTextIndent />
            <RichTextLineHeight />
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <RichTextTaskList />
            <RichTextBlockquote />
            <RichTextHorizontalRule />
            <RichTextCode />
            <RichTextCodeBlock />
            <RichTextColumn />
            <RichTextCallout />
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <RichTextClear />
            <RichTextSearchAndReplace />
            <RichTextEmoji />
            <RichTextExportPdf />
            <RichTextImportWord />
            <RichTextExportWord />
          </div>
        </div>

        {/* Editor Content area */}
        <div className={cn("flex-1 overflow-y-auto bg-[#FCFCFC] relative custom-scrollbar", !fullScreen && "min-h-[400px]")}>
          <div className={cn("mx-auto w-full max-w-4xl bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.08)] min-h-screen my-8 border border-slate-100", !fullScreen && "my-0 shadow-none border-none")}>
            <EditorContent editor={editor} />

            {/* Bubble Menus */}
            {!readOnly && (
              <>
                <RichTextBubbleText />
                <RichTextBubbleImage />
                <RichTextBubbleTable />
                <RichTextBubbleVideo />
                <RichTextBubbleLink />
                <RichTextBubbleCodeBlock />
                <RichTextBubbleCallout />
                <RichTextBubbleImageGif />
                <RichTextBubbleMenuDragHandle />

                {/* Slash Command */}
                <SlashCommandList />
              </>
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400..900;1,400..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

          .tiptap {
            font-family: 'Crimson Pro', serif;
          }

          .tiptap h1 { font-family: 'Inter', sans-serif; font-size: 3rem; font-weight: 800; margin-bottom: 2rem; color: #0f172a; }
          .tiptap h2 { font-family: 'Inter', sans-serif; font-size: 2rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.5rem; color: #1e293b; }
          .tiptap h3 { font-family: 'Inter', sans-serif; font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #334155; }
          
          .tiptap p { margin: 1.5rem 0; }
          .tiptap blockquote { border-left: 3px solid #3b82f6; padding-left: 1.5rem; font-style: italic; color: #475569; margin: 2rem 0; }
          
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

          .tiptap table { border-collapse: collapse; margin: 2rem 0; width: 100%; }
          .tiptap table td, .tiptap table th { border: 1px solid #e2e8f0; padding: 0.75rem; vertical-align: top; }
          .tiptap table th { background: #f8fafc; font-weight: bold; text-align: left; }
          
          .tiptap ul, .tiptap ol { margin: 1.5rem 0 1.5rem 2rem; }
          .tiptap li { margin: 0.5rem 0; }

          .tiptap .image-resizer { display: inline-block; position: relative; }
          
          ${fullScreen ? 'body { overflow: hidden !important; }' : ''}
        `}} />
      </div>
    </RichTextProvider>
  );

  return editorContainer;
}
