import { useState } from 'react';
import {
  RichTextEditor,
  RichTextRenderer,
} from '@/components/editor/rich-text-editor';

export default function EditorTestPage() {
  const [data, setData] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Editor Isolation Test</h1>
        <p className="text-sm text-muted-foreground">
          Phần này dùng <code>RichTextEditor</code> để soạn thảo, và{' '}
          <code>RichTextRenderer</code> để xem preview giống user.
        </p>
      </div>

      <div className="border rounded-md bg-background">
        <RichTextEditor
          onUpdate={(d: string) => setData(d)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Preview qua RichTextRenderer</h2>
        <div className="border rounded-md bg-background p-4">
          <RichTextRenderer content={data} />
        </div>
      </div>
    </div>
  );
}
