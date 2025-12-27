import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import type { CreateModuleDto } from '@workspace/dtos';

const createModuleSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order: z.number().min(0, 'Order must be positive').optional(),
  durationMinutes: z.number().min(0, 'Duration must be positive').optional(),
});

type CreateModuleFormData = z.infer<typeof createModuleSchema>;

interface CreateModuleFormProps {
  onSubmit: (data: CreateModuleDto) => void;
}

export function CreateModuleForm({ onSubmit }: CreateModuleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateModuleFormData>({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      courseId: '',
      title: '',
      order: 0,
      durationMinutes: 0,
    },
  });

  const onSubmitForm = (data: CreateModuleFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Course ID</label>
        <Input
          {...register('courseId')}
          placeholder="Enter course ID"
        />
        {errors.courseId && (
          <p className="text-sm text-red-500 mt-1">{errors.courseId.message}</p>
        )}
      </div>

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
        <Button type="submit">Create Module</Button>
      </div>
    </form>
  );
}
