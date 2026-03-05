// Base Kit
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Placeholder from '@tiptap/extension-placeholder';
// import Collaboration from '@tiptap/extension-collaboration'
// import CollaborationCaret from '@tiptap/extension-collaboration-caret'
// import { HocuspocusProvider } from '@hocuspocus/provider'
// import * as Y from 'yjs'
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect } from 'react';
import { useTheme } from '@/lib/providers/theme-provider';
import { RichTextProvider } from 'reactjs-tiptap-editor';
import { Attachment, RichTextAttachment } from 'reactjs-tiptap-editor/attachment';
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
// Bubble
import {
    RichTextBubbleCallout,
    RichTextBubbleColumns,
    RichTextBubbleDrawer,
    RichTextBubbleExcalidraw,
    RichTextBubbleIframe,
    RichTextBubbleKatex,
    RichTextBubbleLink,
    RichTextBubbleImage,
    RichTextBubbleVideo,
    RichTextBubbleImageGif,
    RichTextBubbleMermaid,
    RichTextBubbleTable,
    RichTextBubbleText,
    RichTextBubbleTwitter,
    RichTextBubbleMenuDragHandle,
} from 'reactjs-tiptap-editor/bubble';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { Callout, RichTextCallout } from 'reactjs-tiptap-editor/callout';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { CodeBlock, RichTextCodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { CodeView, RichTextCodeView } from 'reactjs-tiptap-editor/codeview';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import {
    Column,
    ColumnNode,
    MultipleColumnNode,
    RichTextColumn,
} from 'reactjs-tiptap-editor/column';
import { Drawer, RichTextDrawer } from 'reactjs-tiptap-editor/drawer';
import { Emoji, RichTextEmoji } from 'reactjs-tiptap-editor/emoji';
import { Excalidraw, RichTextExcalidraw } from 'reactjs-tiptap-editor/excalidraw';
import { ExportPdf, RichTextExportPdf } from 'reactjs-tiptap-editor/exportpdf';
import { ExportWord, RichTextExportWord } from 'reactjs-tiptap-editor/exportword';
import { FontFamily, RichTextFontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize, RichTextFontSize } from 'reactjs-tiptap-editor/fontsize';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
// build extensions
import { History, RichTextUndo, RichTextRedo } from 'reactjs-tiptap-editor/history';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Iframe, RichTextIframe } from 'reactjs-tiptap-editor/iframe';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { ImageGif, RichTextImageGif } from 'reactjs-tiptap-editor/imagegif';
import { ImportWord, RichTextImportWord } from 'reactjs-tiptap-editor/importword';
import { Indent, RichTextIndent } from 'reactjs-tiptap-editor/indent';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { Katex, RichTextKatex } from 'reactjs-tiptap-editor/katex';
import { LineHeight, RichTextLineHeight } from 'reactjs-tiptap-editor/lineheight';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { Mermaid, RichTextMermaid } from 'reactjs-tiptap-editor/mermaid';
import { MoreMark, RichTextMoreMark } from 'reactjs-tiptap-editor/moremark';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { SearchAndReplace, RichTextSearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
// Slash Command
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';
import { Strike, RichTextStrike } from 'reactjs-tiptap-editor/strike';
import { Table, RichTextTable } from 'reactjs-tiptap-editor/table';
import { TaskList, RichTextTaskList } from 'reactjs-tiptap-editor/tasklist';
import { TextAlign, RichTextAlign } from 'reactjs-tiptap-editor/textalign';
import { TextDirection, RichTextTextDirection } from 'reactjs-tiptap-editor/textdirection';
import { TextUnderline, RichTextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Twitter, RichTextTwitter } from 'reactjs-tiptap-editor/twitter';
import { Video, RichTextVideo } from 'reactjs-tiptap-editor/video';

import { EMOJI_LIST } from '@/emojis';
import { storageApi } from '@/lib/api/services/storage-api';

import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import 'katex/dist/katex.min.css';
import 'easydrawer/styles.css';
import '@excalidraw/excalidraw/index.css';
import 'katex/contrib/mhchem';

// const ydoc = new Y.Doc()

// const hocuspocusProvider = new HocuspocusProvider({
//   url: 'ws://0.0.0.0:8080',
//   name: 'github.com/hunghg255',
//   document: ydoc,
// })



// custom document to support columns
const DocumentColumn = /* @__PURE__ */ Document.extend({
    content: '(block|columns)+',
});

const MOCK_USERS = [
    {
        id: '0',
        label: 'hunghg255',
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/42096908?v=4',
        },
    },
    {
        id: '1',
        label: 'benjamincanac',
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/739984?v=4',
        },
    },
    {
        id: '2',
        label: 'atinux',
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/904724?v=4',
        },
    },
    {
        id: '3',
        label: 'danielroe',
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/28706372?v=4',
        },
    },
    {
        id: '4',
        label: 'pi0',
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/5158436?v=4',
        },
    },
];

const BaseKit = [
    DocumentColumn,
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
        placeholder: "Press '/' for commands",
    }),
];

const extensions = [
    ...BaseKit,

    History,
    SearchAndReplace,
    Clear,
    FontFamily,
    Heading,
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

                return EMOJI_LIST.filter(({ name }) => name.toLowerCase().includes(lowerCaseQuery));
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
            try {
                const response = await storageApi.uploadFile(file, 'blogs');
                return response.fileUrl;
            } catch (error) {
                console.error("Upload failed:", error);
                throw error;
            }
        },
    }),
    Video.configure({
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
    ImageGif.configure({
        provider: 'giphy',
        API_KEY: import.meta.env.VITE_GIPHY_API_KEY as string,
    }),
    Blockquote,
    HorizontalRule,
    Code,
    CodeBlock,

    Column,
    ColumnNode,
    MultipleColumnNode,
    Table,
    Iframe,
    ExportPdf,
    ImportWord,
    ExportWord,
    TextDirection,
    Attachment.configure({
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
    Katex,
    Excalidraw,
    Mermaid.configure({
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
    Drawer.configure({
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
    Twitter,
    Mention.configure({
        suggestion: {
            char: '@',
            items: async ({ query }: any) => {
                console.log('query', query);
                // const data = MOCK_USERS.map(item => item.label);
                // return data.filter(item => item.toLowerCase().startsWith(query.toLowerCase()));
                return MOCK_USERS.filter((item) =>
                    item.label.toLowerCase().startsWith(query.toLowerCase())
                );
            },
        },
        // suggestions: [
        //   {
        //     char: '@',
        //     items: async ({ query }: any) => {
        //       return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
        //     },
        //   },
        //   {
        //     char: '#',
        //     items: async ({ query }: any) => {
        //       return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
        //     },
        //   }
        // ]
    }),
    SlashCommand,
    CodeView,
    Callout,
    //  Collaboration.configure({
    //   document: hocuspocusProvider.document,
    // }),
    // CollaborationCaret.configure({
    //   provider: hocuspocusProvider,
    //   user: {
    //     color: getRandomColor(),
    //   },
    // }),
];


const RichTextToolbar = () => {
    return (
        <div className='flex items-center gap-2 flex-wrap border-b border-solid'>
            <RichTextUndo />
            <RichTextRedo />
            <RichTextSearchAndReplace />
            <RichTextClear />
            <RichTextFontFamily />
            <RichTextHeading />
            <RichTextFontSize />
            <RichTextBold />
            <RichTextItalic />
            <RichTextUnderline />
            <RichTextStrike />
            <RichTextMoreMark />
            <RichTextEmoji />
            <RichTextColor />
            <RichTextHighlight />
            <RichTextBulletList />
            <RichTextOrderedList />
            <RichTextAlign />
            <RichTextIndent />
            <RichTextLineHeight />
            <RichTextTaskList />
            <RichTextLink />
            <RichTextImage />
            <RichTextVideo />
            <RichTextImageGif />
            <RichTextBlockquote />
            <RichTextHorizontalRule />
            <RichTextCode />
            <RichTextCodeBlock />
            <RichTextColumn />
            <RichTextTable />
            <RichTextIframe />
            <RichTextExportPdf />
            <RichTextImportWord />
            <RichTextExportWord />
            <RichTextTextDirection />
            <RichTextAttachment />
            <RichTextKatex />
            <RichTextExcalidraw />
            <RichTextMermaid />
            <RichTextDrawer />
            <RichTextTwitter />
            <RichTextCodeView />
            <RichTextCallout />
        </div>
    );
};

interface RichTextEditorProps {
    initialContent?: string;
    onUpdate?: (content: string) => void;
}

export function RichTextEditor({ initialContent = '', onUpdate }: RichTextEditorProps) {
    const { theme } = useTheme();

    const editor = useEditor({
        // shouldRerenderOnTransaction:  false,
        textDirection: 'auto', // global text direction
        content: initialContent ?? '',
        extensions: extensions as any[],
        // content
        // immediatelyRender: false, // error duplicate plugin key
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onUpdate?.(html);
        },
    });

    useEffect(() => {
        (window as any).editor = editor;
    }, [editor]);

    return (
        <div className='p-6 flex flex-col w-full gap-6'>
            <RichTextProvider editor={editor} dark={theme === 'dark'}>
                <div className='overflow-hidden rounded-[0.5rem] bg-background shadow outline outline-1'>
                    <div className='flex max-h-full w-full flex-col'>
                        <RichTextToolbar />

                        <EditorContent editor={editor} />

                        {/* Bubble */}
                        <RichTextBubbleCallout />
                        <RichTextBubbleColumns />
                        <RichTextBubbleDrawer />
                        <RichTextBubbleExcalidraw />
                        <RichTextBubbleIframe />
                        <RichTextBubbleKatex />
                        <RichTextBubbleLink />

                        <RichTextBubbleImage />
                        <RichTextBubbleVideo />
                        <RichTextBubbleImageGif />

                        <RichTextBubbleMermaid />
                        <RichTextBubbleTable />
                        <RichTextBubbleText />
                        <RichTextBubbleTwitter />

                        <RichTextBubbleMenuDragHandle />

                        {/* Command List */}
                        <SlashCommandList />
                    </div>
                </div>
            </RichTextProvider>

        </div>
    );
}

export default RichTextEditor;