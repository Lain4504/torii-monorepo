import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { moduleCreateDTOSchema, type ModuleResponseDTO } from '@workspace/schemas';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateModule } from "@/api/services/modules.ts";


const getCreateModuleSchema = (existingTitles: string[] = []) =>
    moduleCreateDTOSchema.extend({
        title: moduleCreateDTOSchema.shape.title.refine(
            (title) => !existingTitles.includes(title.trim()),
            { message: 'A module with this title already exists in this course.' },
        ),
    });

type CreateModuleFormData = z.infer<ReturnType<typeof getCreateModuleSchema>>;

interface CreateModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId?: string;
    courseTitle?: string;
    existingModules?: ModuleResponseDTO[];
}

export function CreateModuleDialog({ open, onOpenChange, courseId, courseTitle, existingModules = [] }: CreateModuleDialogProps) {
    const createModule = useCreateModule();

    const existingTitles = existingModules.map((m) => m.title.trim());
    const createModuleSchema = getCreateModuleSchema(existingTitles);

    const {
        register,
        control,
        handleSubmit,
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
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium mb-1">Course Title</label>
                        <Input value={courseTitle} readOnly />
                        <input type="hidden" {...register('courseId')} />
                    </div>

                    <Controller
                        control={control}
                        name="title"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Enter module title"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Enter description"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="order"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Order</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    placeholder="Enter order"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="durationMinutes"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Duration (minutes)</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    placeholder="Duration in minutes"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button type="submit">Create Module</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
