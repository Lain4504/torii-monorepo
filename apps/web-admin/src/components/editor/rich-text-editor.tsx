import { useEffect, useMemo, useRef } from 'react';
import EditorJS, { type OutputData, type API } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Checklist from '@editorjs/checklist';
import Warning from '@editorjs/warning';
import Paragraph from '@editorjs/paragraph';
// @ts-ignore – no types published
import ImageTool from '@editorjs/image';
// @ts-ignore – no types published
import Embed from '@editorjs/embed';

// ─────────────────────────────────────────────────────────────
//  Shared type
// ─────────────────────────────────────────────────────────────

export type EditorJsData = OutputData;

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function parseContent(raw: EditorJsData | string | null | undefined): EditorJsData | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as EditorJsData;
    } catch {
      return { time: Date.now(), blocks: [{ type: 'paragraph', data: { text: raw } }], version: '2.28.2' };
    }
  }
  return raw;
}

// ─────────────────────────────────────────────────────────────
//  RichTextEditor
// ─────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  initialContent?: EditorJsData | string | null;
  onUpdate?: (data: EditorJsData) => void;
  placeholder?: string;
  minHeight?: number;
  readOnly?: boolean;
}

export function RichTextEditor({
  initialContent,
  onUpdate,
  placeholder = 'Nhập nội dung...',
  minHeight = 300,
  readOnly = false,
}: RichTextEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);

  // Always keep the callback ref fresh so onChange closure never stales
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  // ổn định id cho holder (pattern giống bài viết holder="editor_create")
  const holderId = useMemo(
    () => `editorjs-holder-${Math.random().toString(36).slice(2)}`,
    [],
  );

  useEffect(() => {
    // không chạy trên SSR (pattern bài viết: ssr: false)
    if (typeof window === 'undefined') return;
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: holderId,
      placeholder,
      readOnly,
      data: parseContent(initialContent),
      logLevel: 'ERROR' as any,

      tools: {
        paragraph: { class: Paragraph as any, inlineToolbar: true },
        header: { class: Header as any, inlineToolbar: true, config: { levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2 } },
        list: { class: List as any, inlineToolbar: true, config: { defaultStyle: 'unordered' } },
        checklist: { class: Checklist as any, inlineToolbar: true },
        quote: { class: Quote as any, inlineToolbar: true },
        warning: { class: Warning as any, inlineToolbar: true },
        code: { class: CodeTool as any },
        inlineCode: { class: InlineCode as any, shortcut: 'CMD+SHIFT+M' },
        marker: { class: Marker as any, shortcut: 'CMD+SHIFT+H' },
        delimiter: { class: Delimiter as any },
        table: { class: Table as any, inlineToolbar: true, config: { rows: 2, cols: 3 } },
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: (file: File) =>
                new Promise((resolve) => resolve({ success: 1, file: { url: URL.createObjectURL(file) } })),
              uploadByUrl: (url: string) =>
                Promise.resolve({ success: 1, file: { url } }),
            },
          },
        },
        embed: {
          class: Embed as any,
          config: { services: { youtube: true, vimeo: true, twitter: true, codepen: true } },
        },
      },

      onChange: async (api: API) => {
        const data = await api.saver.save();
        onUpdateRef.current?.(data);
      },

      i18n: {
        messages: {
          ui: {
            blockTunes: { toggler: { 'Click to tune': 'Tuỳ chỉnh', 'or drag to move': 'hoặc kéo để di chuyển' } },
            inlineToolbar: { converter: { 'Convert to': 'Chuyển sang' } },
            toolbar: { toolbox: { Add: 'Thêm' } },
          },
          toolNames: {
            Text: 'Văn bản', Heading: 'Tiêu đề', List: 'Danh sách',
            Quote: 'Trích dẫn', Code: 'Code', Delimiter: 'Phân cách',
            Table: 'Bảng', Link: 'Liên kết', Marker: 'Đánh dấu',
            Bold: 'Đậm', Italic: 'Nghiêng', InlineCode: 'Code nội dòng',
            Image: 'Hình ảnh', Checklist: 'Danh sách kiểm tra', Warning: 'Cảnh báo', Embed: 'Nhúng',
          },
          tools: {
            warning: { Title: 'Tiêu đề', Message: 'Nội dung' },
            link: { 'Add a link': 'Nhập liên kết' },
            image: { Caption: 'Chú thích', 'Select an Image': 'Chọn ảnh', 'With border': 'Viền', 'Stretch image': 'Kéo rộng', 'With background': 'Nền' },
            code: { 'Enter a code': 'Nhập code...' },
            list: { Ordered: 'Có thứ tự', Unordered: 'Không thứ tự' },
            table: {
              Heading: 'Tiêu đề cột', 'With headings': 'Có tiêu đề', 'Without headings': 'Không tiêu đề',
              'Add column to left': 'Thêm cột trái', 'Add column to right': 'Thêm cột phải', 'Delete column': 'Xóa cột',
              'Add row above': 'Thêm hàng trên', 'Add row below': 'Thêm hàng dưới', 'Delete row': 'Xóa hàng',
            },
            quote: { 'Align Left': 'Căn trái', 'Align Center': 'Căn giữa' },
          },
          blockTunes: {
            delete: { Delete: 'Xóa', 'Click to delete': 'Nhấn để xóa' },
            moveUp: { 'Move up': 'Lên' },
            moveDown: { 'Move down': 'Xuống' },
          },
        },
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy?.();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holderId, placeholder, readOnly, initialContent]);

  return (
    <div
      className="border border-border rounded-md bg-background overflow-visible"
      style={{ minHeight }}
    >
      <style>{`
        .codex-editor { padding: 0.75rem 1rem; }
        .codex-editor__redactor { padding-bottom: 80px !important; }
        .ce-toolbar__content, .ce-block__content { max-width: 100% !important; }
        .ce-toolbar__content { max-width: calc(100% - 72px) !important; }
        .cdx-block { padding: 0.5rem 0; }
        .ce-delimiter::before { content: "— — —"; }
      `}</style>
      <div id={holderId} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  RichTextRenderer  –  no editor instance, pure React render
// ─────────────────────────────────────────────────────────────

interface RichTextRendererProps {
  content: EditorJsData | string | null | undefined;
  className?: string;
}

function renderBlock(block: OutputData['blocks'][number]): React.ReactNode {
  const { type, data } = block;

  switch (type) {
    case 'header': {
      const Tag = `h${data.level ?? 2}` as keyof React.JSX.IntrinsicElements;
      const sizes: Record<number, string> = { 1: 'text-4xl', 2: 'text-3xl', 3: 'text-2xl', 4: 'text-xl', 5: 'text-lg', 6: 'text-base' };
      return <Tag key={block.id} className={`font-bold my-2 ${sizes[data.level] ?? 'text-xl'}`} dangerouslySetInnerHTML={{ __html: data.text ?? '' }} />;
    }
    case 'paragraph':
      return <p key={block.id} className="my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.text ?? '' }} />;

    case 'list':
      return data.style === 'ordered'
        ? <ol key={block.id} className="list-decimal list-inside my-2 space-y-1 pl-4">
          {(data.items ?? []).map((item: any, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: typeof item === 'string' ? item : item.content ?? '' }} />
          ))}
        </ol>
        : <ul key={block.id} className="list-disc list-inside my-2 space-y-1 pl-4">
          {(data.items ?? []).map((item: any, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: typeof item === 'string' ? item : item.content ?? '' }} />
          ))}
        </ul>;

    case 'checklist':
      return (
        <ul key={block.id} className="my-2 space-y-1">
          {(data.items ?? []).map((item: any, i: number) => (
            <li key={i} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={item.checked} readOnly className="accent-primary" />
              <span dangerouslySetInnerHTML={{ __html: item.text ?? '' }} />
            </li>
          ))}
        </ul>
      );

    case 'quote':
      return (
        <blockquote key={block.id} className="border-l-4 border-primary pl-4 my-3 italic text-muted-foreground">
          <div dangerouslySetInnerHTML={{ __html: data.text ?? '' }} />
          {data.caption && <cite className="block mt-1 text-sm not-italic font-medium">— {data.caption}</cite>}
        </blockquote>
      );

    case 'code':
      return (
        <pre key={block.id} className="bg-muted rounded-md p-4 my-3 overflow-x-auto text-sm font-mono">
          <code>{data.code ?? ''}</code>
        </pre>
      );

    case 'delimiter':
      return <hr key={block.id} className="border-border my-6" />;

    case 'warning':
      return (
        <div key={block.id} className="border border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 rounded-md p-4 my-3">
          {data.title && <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">{data.title}</p>}
          <p className="text-yellow-700 dark:text-yellow-300 text-sm" dangerouslySetInnerHTML={{ __html: data.message ?? '' }} />
        </div>
      );

    case 'table': {
      const rows: string[][] = data.content ?? [];
      const hasHeadings = data.withHeadings && rows.length > 0;
      return (
        <div key={block.id} className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-border text-sm">
            {hasHeadings && (
              <thead className="bg-muted">
                <tr>{rows[0].map((cell, ci) => <th key={ci} className="border border-border px-3 py-2 text-left font-semibold" dangerouslySetInnerHTML={{ __html: cell }} />)}</tr>
              </thead>
            )}
            <tbody>
              {(hasHeadings ? rows.slice(1) : rows).map((row, ri) => (
                <tr key={ri} className="odd:bg-background even:bg-muted/30">
                  {row.map((cell, ci) => <td key={ci} className="border border-border px-3 py-2" dangerouslySetInnerHTML={{ __html: cell }} />)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'image':
      return (
        <figure key={block.id} className="my-4">
          <img
            src={data.file?.url ?? data.url ?? ''}
            alt={data.caption ?? ''}
            className={`rounded-md max-w-full ${data.stretched ? 'w-full' : 'mx-auto'} ${data.withBorder ? 'border border-border' : ''} ${data.withBackground ? 'bg-muted p-4' : ''}`}
          />
          {data.caption && <figcaption className="text-center text-sm text-muted-foreground mt-2" dangerouslySetInnerHTML={{ __html: data.caption }} />}
        </figure>
      );

    case 'embed':
      return (
        <div key={block.id} className="my-4 aspect-video">
          <iframe src={data.embed ?? data.url} title={data.caption ?? 'Embedded'} className="w-full h-full rounded-md border border-border" allowFullScreen />
          {data.caption && <p className="text-center text-sm text-muted-foreground mt-1">{data.caption}</p>}
        </div>
      );

    default:
      return <div key={block.id} className="my-2 text-muted-foreground text-xs italic">[Unsupported block: {type}]</div>;
  }
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  const parsed = parseContent(content);

  if (!parsed?.blocks?.length) {
    return <div className={className ?? 'text-muted-foreground text-sm italic'}>Không có nội dung.</div>;
  }

  return (
    <div className={className ?? 'prose prose-sm max-w-none dark:prose-invert'}>
      {parsed.blocks.map((block) => renderBlock(block))}
    </div>
  );
}

export default RichTextEditor;
