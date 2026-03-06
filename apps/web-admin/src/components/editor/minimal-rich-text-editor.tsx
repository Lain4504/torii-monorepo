import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import { useTheme } from '@/lib/providers/theme-provider';
import { RichTextProvider } from 'reactjs-tiptap-editor';
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { CodeBlock, RichTextCodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
import { History, RichTextUndo, RichTextRedo } from 'reactjs-tiptap-editor/history';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { Strike, RichTextStrike } from 'reactjs-tiptap-editor/strike';
import { Table, RichTextTable } from 'reactjs-tiptap-editor/table';
import { TextAlign, RichTextAlign } from 'reactjs-tiptap-editor/textalign';
import { TextUnderline, RichTextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { FontSize, RichTextFontSize } from 'reactjs-tiptap-editor/fontsize';

import { storageApi } from '@/lib/api/services/storage-api';

import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';

const BaseKit = [
    Document,
    Text,
    Dropcursor.configure({
        class: 'reactjs-tiptap-editor-theme',
        color: 'hsl(var(--primary))',
        width: 2,
    }),
    Gapcursor,
    HardBreak,
    Paragraph,
    ListItem,
    TextStyle,
    Placeholder.configure({
        placeholder: "Write something...",
    }),
];

const extensions = [
    ...BaseKit,
    History,
    Clear,
    Heading,
    FontSize,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    Color,
    Highlight,
    BulletList,
    OrderedList,
    TextAlign,
    Link,
    Image.configure({
        upload: async (file: File) => {
            try {
                const response = await storageApi.uploadFile(file, 'blogs');
                return response.fileUrl;
            } catch (error) {
                console.error("Upload failed:", error);
                throw error;
            }
        },
    }),
    Blockquote,
    HorizontalRule,
    Code,
    CodeBlock,
    Table,
];

const MinimalRichTextToolbar = () => {
    return (
        <div className='flex items-center gap-2 flex-wrap border-b border-solid p-1'>
            <RichTextUndo />
            <RichTextRedo />
            <RichTextClear />
            <RichTextHeading />
            <RichTextFontSize />
            <RichTextBold />
            <RichTextItalic />
            <RichTextUnderline />
            <RichTextStrike />
            <RichTextColor />
            <RichTextHighlight />
            <RichTextBulletList />
            <RichTextOrderedList />
            <RichTextAlign />
            <RichTextLink />
            <RichTextImage />
            <RichTextTable />
            <RichTextBlockquote />
            <RichTextHorizontalRule />
            <RichTextCode />
            <RichTextCodeBlock />
        </div>
    );
};

interface MinimalRichTextEditorProps {
    initialContent?: string;
    onUpdate?: (content: string) => void;
    placeholder?: string;
}

export function MinimalRichTextEditor({ initialContent = '', onUpdate }: MinimalRichTextEditorProps) {
    const { theme } = useTheme();

    const editor = useEditor({
        textDirection: 'auto',
        content: initialContent ?? '',
        extensions: extensions as any[],
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onUpdate?.(html);
        },
    });

    return (
        <div className='flex flex-col w-full'>
            <RichTextProvider editor={editor} dark={theme === 'dark'}>
                <div className='overflow-hidden rounded-md bg-background border shadow-sm'>
                    <div className='flex max-h-full w-full flex-col'>
                        <MinimalRichTextToolbar />
                        <div className="min-h-[150px] p-4">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>
            </RichTextProvider>
        </div>
    );
}

export default MinimalRichTextEditor;
