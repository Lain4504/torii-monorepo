import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { moduleUpdateDTOSchema, type ModuleResponseDTO } from '@workspace/schemas';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[600px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden">
                <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5 space-y-1">
                    <SheetTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Edit Module
                    </SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground">
                        Update the module information and ordering within the course.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 py-6 space-y-6">
                            <div className="space-y-4">
                                <Field>
                                    <FieldLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        Course Title
                                    </FieldLabel>
                                    <Input
                                        value={courseTitle}
                                        readOnly
                                        className="h-11 border-none bg-muted/50 text-muted-foreground rounded-xl"
                                    />
                                    <input type="hidden" {...register('courseId')} />
                                </Field>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                                Title
                                            </FieldLabel>
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
                                            <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                                Description
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="Enter description"
                                                className="min-h-[80px] border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all resize-none"
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
                                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                                    Order
                                                </FieldLabel>
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
                                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                                    Duration (mins)
                                                </FieldLabel>
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
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="flex-shrink-0 px-6 py-4 border-t border-border/40 bg-muted/5 backdrop-blur-sm flex-row gap-3">
                        <div className="flex items-center justify-end w-full gap-3">
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
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

