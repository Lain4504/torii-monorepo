import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import type { UpdateModuleDto, ModuleResponseDto } from '@workspace/dtos';

const updateModuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order: z.number().min(0, 'Order must be positive').optional(),
  durationMinutes: z.number().min(0, 'Duration must be positive').optional(),
});

type UpdateModuleFormData = z.infer<typeof updateModuleSchema>;

interface EditModuleFormProps {
  module: ModuleResponseDto;
  onSubmit: (data: UpdateModuleDto) => void;
  onCancel: () => void;
}

export function EditModuleForm({ module, onSubmit, onCancel }: EditModuleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateModuleFormData>({
    resolver: zodResolver(updateModuleSchema),
    defaultValues: {
      title: module.title,
      description: module.description,
      order: module.order,
      durationMinutes: module.durationMinutes,
    },
  });

  const onSubmitForm = (data: UpdateModuleFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          {...register('title')}
          placeholder="Enter module title"
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          {...register('description')}
          placeholder="Enter module description"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Order</label>
        <Input
          type="number"
          {...register('order', { valueAsNumber: true })}
          placeholder="Enter order"
        />
        {errors.order && (
          <p className="text-sm text-red-500 mt-1">{errors.order.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
        <Input
          type="number"
          {...register('durationMinutes', { valueAsNumber: true })}
          placeholder="Enter duration in minutes"
        />
        {errors.durationMinutes && (
          <p className="text-sm text-red-500 mt-1">{errors.durationMinutes.message}</p>
        )}
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
