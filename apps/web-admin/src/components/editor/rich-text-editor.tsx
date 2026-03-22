import { useEffect, useState, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';

// ─────────────────────────────────────────────────────────────
//  RichTextEditor
// ─────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  /** Controlled: dùng cùng `onChange` (ví dụ react-hook-form Controller). */
  value?: string;
  onChange?: (data: string) => void;
  /** Uncontrolled: đồng bộ từ bên ngoài khi không dùng value/onChange */
  initialContent?: string | null;
  onUpdate?: (data: string) => void;
  placeholder?: string;
  minHeight?: number;
  readOnly?: boolean;
}

export function RichTextEditor({
  value: controlledValue,
  onChange: controlledOnChange,
  initialContent,
  onUpdate,
  placeholder = 'Nhập nội dung...',
  minHeight = 300,
  readOnly = false,
}: RichTextEditorProps) {
  const isControlled = controlledOnChange !== undefined;
  const [internalValue, setInternalValue] = useState(initialContent ?? '');
  const lastPushedValue = useRef(initialContent ?? '');

  const value = isControlled ? (controlledValue ?? '') : internalValue;

  useEffect(() => {
    if (isControlled) return;
    const newVal = initialContent ?? '';
    if (newVal !== lastPushedValue.current) {
      setInternalValue(newVal);
      lastPushedValue.current = newVal;
    }
  }, [initialContent, isControlled]);

  const handleChange = (val?: string) => {
    const newValue = val ?? '';
    if (!isControlled) {
      setInternalValue(newValue);
      lastPushedValue.current = newValue;
    }
    controlledOnChange?.(newValue);
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

