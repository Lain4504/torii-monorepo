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
import { Loader2, Plus } from 'lucide-react';

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
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Tạo Học Phần Mới</SheetTitle>
                    <SheetDescription>
                        Khóa học: {courseTitle || 'Chưa có tên'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            <input type="hidden" {...register('courseId')} />

                            <Controller
                                control={control}
                                name="title"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Tên Học Phần</FieldLabel>
                                        <Input
                                            id={field.name}
                                            {...field}
                                            placeholder="VD: Bài 1 - Giới thiệu về ngữ pháp"
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={control}
                                name="description"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Mô Tả</FieldLabel>
                                        <Textarea
                                            id={field.name}
                                            {...field}
                                            placeholder="Mô tả ngắn gọn nội dung học viên sẽ học..."
                                            className="min-h-[100px]"
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={control}
                                    name="orderIndex"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Thứ Tự</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="durationMinutes"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Thời Lượng (phút)</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
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
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
