import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateModule } from '@/features/modules/api/modules';
import type { ModuleResponseDto } from '@workspace/dtos';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';

const getCreateModuleSchema = (existingTitles: string[] = []) =>
    z.object({
        courseId: z.string().min(1, 'Course ID is required'),
        title: z
            .string()
            .min(1, 'Title is required')
            .refine(
                (title) => !existingTitles.includes(title.trim()),
                { message: 'A module with this title already exists in this course.' },
            ),
        description: z.string().optional(),
        order: z.number().min(0).optional(),
        durationMinutes: z.number().min(0).optional(),
    });

type CreateModuleFormData = z.infer<ReturnType<typeof getCreateModuleSchema>>;

interface CreateModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId?: string;
    courseTitle?: string;
    existingModules?: ModuleResponseDto[];
}

export function CreateModuleDialog({ open, onOpenChange, courseId, courseTitle, existingModules = [] }: CreateModuleDialogProps) {
    const createModule = useCreateModule();

    const existingTitles = existingModules.map((m) => m.title.trim());
    const createModuleSchema = getCreateModuleSchema(existingTitles);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateModuleFormData>({
        resolver: zodResolver(createModuleSchema),
        defaultValues: {
            courseId: courseId || '',
            title: '',
        },
    });

    const onSubmitForm = async (data: CreateModuleFormData) => {
        try {
            await createModule.mutateAsync(data);
            toast.success('Module created successfully!', {
                description: `${data.title} has been added.`,
            });
            onOpenChange(false);
            reset();
        } catch (error: any) {
            toast.error('Failed to create module', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Module</DialogTitle>
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
                        <Button type="submit">Create Module</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
