import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { moduleUpdateDTOSchema, type ModuleResponseDTO } from '@workspace/schemas';
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
import { useUpdateModule } from "@/api/services/modules.ts";

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
        control,
        handleSubmit,
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
                orderIndex: module.orderIndex,
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
            <DialogContent className="max-w-md border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-muted/30">
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Edit Module</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 pt-4 space-y-5" noValidate>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Course Title</label>
                        <Input
                            value={courseTitle}
                            readOnly
                            className="h-11 border-none bg-muted/50 text-muted-foreground rounded-xl"
                        />
                        <input type="hidden" {...register('courseId')} />
                    </div>

                    <Controller
                        control={control}
                        name="title"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Title</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Enter module title"
                                    className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Description</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    value={field.value || ''}
                                    placeholder="Enter description"
                                    className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            control={control}
                            name="orderIndex"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Order</FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        placeholder="1"
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="durationMinutes"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Duration (mins)</FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        placeholder="60"
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl h-11 px-6 hover:bg-primary/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            Update Module
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
