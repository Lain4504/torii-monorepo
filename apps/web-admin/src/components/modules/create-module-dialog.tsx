import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { moduleCreateDTOSchema, type ModuleResponseDTO, type ModuleCreateDTO } from '@workspace/schemas';
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

type CreateModuleFormData = ModuleCreateDTO;

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
        // The schema is compatible with ModuleCreateDTO, but we cast to satisfy React Hook Form's Resolver typing.
        resolver: zodResolver(createModuleSchema) as any,
        defaultValues: {
            courseId: courseId || '',
            title: '',
            orderIndex: existingModules.length + 1,
            durationMinutes: 0,
            aiMetadata: {},
        },
    });

    const onSubmitForm: SubmitHandler<CreateModuleFormData> = async (data) => {
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
            <DialogContent className="max-w-md border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-muted/30">
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Create New Module</DialogTitle>
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
                            onClick={handleClose}
                            className="rounded-xl h-11 px-6 hover:bg-primary/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            Create Module
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
