import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { moduleUpdateDTOSchema, type ModuleResponseDTO } from '@workspace/schemas';
import { useUpdateModule } from '@/features/modules/api/modules';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';

import { toast } from '@workspace/ui/components/sonner';

const getUpdateModuleSchema = (existingTitles: string[] = []) =>
    moduleUpdateDTOSchema.extend({
        title: moduleUpdateDTOSchema.shape.title!.refine((title) => !title || !existingTitles.includes(title.trim()), {
            message: 'A module with this title already exists in this course.',
        }),
    });

type UpdateModuleFormData = z.infer<ReturnType<typeof getUpdateModuleSchema>>;

interface EditModuleDialogProps {
    module: ModuleResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    existingModules?: ModuleResponseDTO[];
    courseTitle?: string;
}

export function EditModuleDialog({ module, open, onOpenChange, existingModules = [], courseTitle }: EditModuleDialogProps) {
    const updateModule = useUpdateModule();

    // Exclude the current module's title from the list for validation
    const otherModuleTitles = existingModules
        .filter((m) => m.id !== module?.id)
        .map((m) => m.title.trim());

    const updateModuleSchema = getUpdateModuleSchema(otherModuleTitles);

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
                        <label className="block text-sm font-medium mb-1">Course Title</label>
                        <Input value={courseTitle} readOnly />
                        <input type="hidden" {...register('courseId')} />
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
