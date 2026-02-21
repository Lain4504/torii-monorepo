import { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { moduleCreateDTOSchema, type ModuleResponseDTO, type ModuleCreateDTO } from '@workspace/schemas';
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
import { useCreateModule } from "@/api/services/modules.ts";
import { Layers, AlignLeft, Clock, Hash, Loader2, Plus, Box } from 'lucide-react';

const getCreateModuleSchema = (existingTitles: string[] = []) =>
    moduleCreateDTOSchema.extend({
        title: moduleCreateDTOSchema.shape.title.refine(
            (title) => !existingTitles.includes(title.trim()),
            { message: 'Học phần với tiêu đề này đã tồn tại trong khóa học này.' },
        ),
    });

type CreateModuleFormData = ModuleCreateDTO;

interface CreateModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId?: string;
    existingModules?: ModuleResponseDTO[];
    courseTitle?: string;
}

export function CreateModuleSheet({ open, onOpenChange, courseId, existingModules = [], courseTitle }: CreateModuleDialogProps) {
    const createModule = useCreateModule();

    const existingTitles = existingModules.map((m) => m.title.trim());
    const createModuleSchema = getCreateModuleSchema(existingTitles);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<CreateModuleFormData>({
        // The schema is compatible with ModuleCreateDTO, but we cast to satisfy React Hook Form's Resolver typing.
        resolver: zodResolver(createModuleSchema) as any,
        defaultValues: {
            courseId: courseId || '',
            title: '',
            orderIndex: existingModules.length + 1,
            durationMinutes: 0,
        },
    });

    // Reset form when courseId changes
    useEffect(() => {
        if (courseId) {
            reset({
                courseId: courseId,
                title: '',
                orderIndex: existingModules.length + 1,
                durationMinutes: 0,
            });
        }
    }, [courseId, reset, existingModules.length]);

    const onSubmitForm: SubmitHandler<CreateModuleFormData> = async (data) => {
        try {
            await createModule.mutateAsync(data);
            toast.success('Đã tạo học phần', {
                description: `${data.title} đã được thêm vào khóa học.`,
            });
            onOpenChange(false);
            reset();
        } catch (error: any) {
            toast.error('Tạo thất bại', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:w-[800px] !max-w-[800px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background [&>button]:top-6 [&>button]:right-6 [&>button]:bg-background/20 [&>button]:rounded-xl [&>button]:w-10 [&>button]:h-10">

                {/* Header Section with Ambient Glow */}
                {/* Header Section */}
                <SheetHeader className="px-6 py-6 border-b border-border/10 flex-shrink-0">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                <Box className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-xl font-bold tracking-tight">
                                    Tạo Học Phần Mới
                                </SheetTitle>
                                <p className="text-xs font-medium text-muted-foreground/60">
                                    Khóa học: <span className="text-foreground">{courseTitle || 'Chưa có tên'}</span>
                                </p>
                            </div>
                        </div>
                        <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
                            Tổ chức nội dung khóa học bằng cách tạo các học phần mới.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 py-8 space-y-8">
                            <input type="hidden" {...register('courseId')} />

                            <Controller
                                control={control}
                                name="title"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2 uppercase tracking-wider">
                                            <Layers className="size-3.5" />
                                            Tên Học Phần
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                placeholder="VD: Bài 1 - Giới thiệu về ngữ pháp"
                                                className="h-11 pl-4 pr-4 rounded-xl border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                                            />
                                        </div>
                                        <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive ml-1" />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={control}
                                name="description"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2 uppercase tracking-wider">
                                            <AlignLeft className="size-3.5" />
                                            Mô Tả
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            placeholder="Mô tả ngắn gọn nội dung học viên sẽ học..."
                                            className="min-h-[100px] p-4 rounded-xl border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all resize-none font-medium text-sm leading-relaxed"
                                        />
                                        <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive ml-1" />
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-6">
                                <Controller
                                    control={control}
                                    name="orderIndex"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2 uppercase tracking-wider">
                                                <Hash className="size-3.5" />
                                                Thứ Tự
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                className="h-11 rounded-xl border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-mono font-medium text-sm"
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive ml-1" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="durationMinutes"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2 uppercase tracking-wider">
                                                <Clock className="size-3.5" />
                                                Thời Lượng (phút)
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                className="h-11 rounded-xl border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-mono font-medium text-sm"
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive ml-1" />
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter>
                        <div className="flex w-full gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}>
                                Hủy Bỏ
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tạo Học Phần
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
