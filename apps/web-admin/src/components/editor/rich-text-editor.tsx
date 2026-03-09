import { useEffect, useState, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';

// ─────────────────────────────────────────────────────────────
//  RichTextEditor
// ─────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  initialContent?: string | null;
  onUpdate?: (data: string) => void;
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
  const [value, setValue] = useState(initialContent ?? '');
  const lastPushedValue = useRef(initialContent ?? '');

  useEffect(() => {
    const newVal = initialContent ?? '';
    if (newVal !== lastPushedValue.current) {
      setValue(newVal);
      lastPushedValue.current = newVal;
    }
  }, [initialContent]);

  const handleChange = (val?: string) => {
    const newValue = val ?? '';
    setValue(newValue);
    lastPushedValue.current = newValue;
    onUpdate?.(newValue);
  };

  return (
    <div className="w-full" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={handleChange}
        height={minHeight}
        preview={readOnly ? 'preview' : 'live'}
        hideToolbar={readOnly}
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  RichTextRenderer  –  For purely viewing markdown content
// ─────────────────────────────────────────────────────────────

interface RichTextRendererProps {
  content: string | null | undefined;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content) {
    return <div className={className ?? 'text-muted-foreground text-sm italic'}>Không có nội dung.</div>;
  }

  return (
    <div className={className ?? 'w-full'} data-color-mode="light">
      <MDEditor.Markdown source={content} style={{ whiteSpace: 'pre-wrap' }} />
    </div>
  );
}

export default RichTextEditor;

