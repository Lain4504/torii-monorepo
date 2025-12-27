import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import type { CreateModuleDto } from '@workspace/dtos';

interface CreateModuleFormProps {
  onSubmit: (data: CreateModuleDto) => void;
}

export function CreateModuleForm({ onSubmit }: CreateModuleFormProps) {
  const [formData, setFormData] = useState<CreateModuleDto>({
    courseId: '',
    title: '',
    order: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Course ID</label>
        <Input
          value={formData.courseId}
          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Order</label>
        <Input
          type="number"
          value={formData.order || 0}
          onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
        <Input
          type="number"
          value={formData.durationMinutes || 0}
          onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setFormData({ courseId: '', title: '', order: 0 })}>
          Reset
        </Button>
        <Button type="submit">Create Module</Button>
      </div>
    </form>
  );
}
