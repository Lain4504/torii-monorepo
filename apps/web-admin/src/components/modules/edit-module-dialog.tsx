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
import { Layers, AlignLeft, Clock, Hash, Loader2, Save, Box, BookOpen } from 'lucide-react';

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
        formState: { isSubmitting },
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
            toast.success('Module Reconfigured', {
                description: `Changes to ${data.title || module.title} have been saved to the matrix.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Update Failed', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    if (!module) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[600px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/10 shadow-2xl bg-background/80 backdrop-blur-3xl overflow-hidden [&>button]:top-6 [&>button]:right-6 [&>button]:bg-background/20 [&>button]:rounded-xl [&>button]:w-10 [&>button]:h-10">

                {/* Header Section with Ambient Glow */}
                <SheetHeader className="px-8 py-8 border-b border-border/10 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50" />
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5">
                                <Box className="size-5" />
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                    Edit <span className="text-primary not-italic">Module Node</span>
                                </SheetTitle>
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                    ID: {module.id.substring(0, 8)}...
                                </p>
                            </div>
                        </div>
                        <SheetDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed max-w-md">
                            Modify the structural parameters and metadata for this content module.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 py-8 space-y-8">
                            <input type="hidden" {...register('courseId')} />

                            {courseTitle && (
                                <div className="space-y-2 opacity-60 pointer-events-none">
                                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                        <BookOpen className="size-3" />
                                        Parent Repository
                                    </FieldLabel>
                                    <Input
                                        value={courseTitle}
                                        readOnly
                                        className="h-14 pl-4 pr-4 rounded-2xl border-border/20 bg-muted/20 font-bold text-base"
                                    />
                                </div>
                            )}

                            <Controller
                                control={control}
                                name="title"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                            <Layers className="size-3" />
                                            Module Designation
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                placeholder="ENTER MODULE TITLE..."
                                                className="h-14 pl-4 pr-4 rounded-2xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all font-bold text-base"
                                            />
                                        </div>
                                        <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase tracking-wider text-red-500 ml-1" />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={control}
                                name="description"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                            <AlignLeft className="size-3" />
                                            Content Overview
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            value={field.value || ''}
                                            placeholder="DESCRIBE THE MODULE OBJECTIVES..."
                                            className="min-h-[120px] p-4 rounded-2xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all resize-none font-medium leading-relaxed"
                                        />
                                        <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase tracking-wider text-red-500 ml-1" />
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-6">
                                <Controller
                                    control={control}
                                    name="orderIndex"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                                <Hash className="size-3" />
                                                Sequence Index
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                className="h-14 rounded-2xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all font-mono font-bold"
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase tracking-wider text-red-500 ml-1" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="durationMinutes"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                                <Clock className="size-3" />
                                                Est. Duration (Min)
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                className="h-14 rounded-2xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all font-mono font-bold"
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase tracking-wider text-red-500 ml-1" />
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="px-8 py-6 border-t border-border/10 bg-muted/5 flex-shrink-0">
                        <div className="flex w-full gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="flex-1 h-12 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-muted/10 border border-transparent hover:border-border/10"
                            >
                                Discard Changes
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] h-12 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Commit Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
