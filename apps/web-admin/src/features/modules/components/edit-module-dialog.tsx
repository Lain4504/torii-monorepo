import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateModule } from '@/features/modules/api/modules';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import type { ModuleResponseDto } from '@workspace/dtos';
import { toast } from '@workspace/ui/components/sonner';

const updateModuleSchema = z.object({
    courseId: z.string().optional(),
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    order: z.number().min(0).optional(),
    durationMinutes: z.number().min(0).optional(),
});

type UpdateModuleFormData = z.infer<typeof updateModuleSchema>;

interface EditModuleDialogProps {
    module: ModuleResponseDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditModuleDialog({ module, open, onOpenChange }: EditModuleDialogProps) {
    const updateModule = useUpdateModule();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UpdateModuleFormData>({
        resolver: zodResolver(updateModuleSchema),
        defaultValues: {
            title: '',
            courseId: '',
        },
    });

    useEffect(() => {
        if (module) {
            reset({
                title: module.title,
                courseId: module.courseId,
                description: module.description,
                order: module.order,
                durationMinutes: module.durationMinutes,
            });
        }
    }, [module, reset]);

    const onSubmitForm = async (data: UpdateModuleFormData) => {
        if (!module) return;

        try {
            await updateModule.mutateAsync({ id: module.id, module: data });
            toast.success('Module updated successfully!', {
                description: `Changes to ${data.title || module.title} have been saved.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to update module', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    if (!module) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Module</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Course ID</label>
                        <Input {...register('courseId')} placeholder="Enter course id" />
                        {errors.courseId && (
                            <p className="text-sm text-red-500 mt-1">{errors.courseId.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input {...register('title')} placeholder="Enter module title" />
                        {errors.title && (
                            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input {...register('description')} placeholder="Enter description" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Order</label>
                        <Input type="number" {...register('order', { valueAsNumber: true })} placeholder="Enter order" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                        <Input type="number" {...register('durationMinutes', { valueAsNumber: true })} placeholder="Duration in minutes" />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Update Module</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
