import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import type { UpdateModuleDto } from '@workspace/dtos';

interface EditModuleFormProps {
  module: any;
  onSubmit: (data: UpdateModuleDto) => void;
  onCancel: () => void;
}

export function EditModuleForm({ module, onSubmit, onCancel }: EditModuleFormProps) {
  const [formData, setFormData] = useState<UpdateModuleDto>({
    title: module.title,
    description: module.description,
    order: module.order,
    durationMinutes: module.durationMinutes,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Module</Button>
      </div>
    </form>
  );
}
