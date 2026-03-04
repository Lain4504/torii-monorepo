import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Save, Info } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateQuestionPool } from '@/lib/api/services/question-pools.ts';
import { useCourses } from '@/lib/api/services/courses.ts';
import {
    QuestionJlptLevel,
    questionPoolUpdateDTOSchema,
    type QuestionPoolResponseDTO,
} from '@workspace/schemas';
import type { z } from 'zod';
import { Spinner } from "@workspace/ui/components/spinner";

type UpdateQuestionPoolFormData = z.input<typeof questionPoolUpdateDTOSchema>;

interface EditQuestionPoolDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pool: QuestionPoolResponseDTO | null;
}

export function EditQuestionPoolDialog({ open, onOpenChange, pool }: EditQuestionPoolDialogProps) {
    const updatePool = useUpdateQuestionPool();
    const { data: coursesData } = useCourses({ page: 1, limit: 100 });

    const {
        control,
        handleSubmit,
        reset,
        watch,
    } = useForm<UpdateQuestionPoolFormData>({
        resolver: zodResolver(questionPoolUpdateDTOSchema),
        defaultValues: {
            name: '',
            description: '',
            courseMasterId: undefined,
            lessonId: undefined,
            jlptLevel: undefined,
        },
    });

    const selectedCourseId = watch('courseMasterId');
    const selectedCourse = coursesData?.data?.find(c => c.id === selectedCourseId);

    useEffect(() => {
        if (pool) {
            reset({
                name: pool.name,
                description: pool.description || '',
                courseMasterId: pool.courseMasterId || undefined,
                lessonId: pool.lessonId || undefined,
                jlptLevel: pool.jlptLevel as QuestionJlptLevel || undefined,
            });
        }
    }, [pool, reset]);

    const onSubmit = async (data: UpdateQuestionPoolFormData) => {
        if (!pool) return;

        try {
            await updatePool.mutateAsync({ id: pool.id, pool: data });
            toast.success('Đã cập nhật kho đề', {
                description: `Thông tin kho đề "${data.name}" đã được cập nhật thành công.`
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Cập nhật thất bại', {
                description: error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật kho đề.'
            });
        }
    };

    if (!pool) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[80vh]" noValidate>
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle>Chỉnh Sửa Kho Đề</DialogTitle>
                        <DialogDescription>
                            Cập nhật lại tiêu đề, mô tả hoặc thay đổi các liên kết của kho đề câu hỏi.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            <div className="space-y-6">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Tên Kho Đề *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="VD: Từ vựng N5 - Bài 1"
                                            />
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Mô Tả Tóm Tắt</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập mô tả cụ thể cho kho đề..."
                                                className="min-h-[120px]"
                                            />
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        name="courseMasterId"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Khóa Học Liên Kết</FieldLabel>
                                                <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                                    <SelectTrigger id={field.name}>
                                                        <SelectValue placeholder="Chọn khóa học" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Không chỉ định</SelectItem>
                                                        {coursesData?.data?.map((course) => (
                                                            <SelectItem key={course.id} value={course.id}>
                                                                {course.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="jlptLevel"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Cấp Độ JLPT</FieldLabel>
                                                <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                                    <SelectTrigger id={field.name}>
                                                        <SelectValue placeholder="Chọn JLPT" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Không chỉ định</SelectItem>
                                                        {[QuestionJlptLevel.N1, QuestionJlptLevel.N2, QuestionJlptLevel.N3, QuestionJlptLevel.N4, QuestionJlptLevel.N5].map(level => (
                                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />
                                </div>

                                {selectedCourse && (
                                    <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-4">
                                        <Info className="size-4 text-primary mt-1" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Khóa học hiện tại</p>
                                            <p className="text-sm font-medium leading-tight">{selectedCourse.title}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}>
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={updatePool.isPending}>
                            {updatePool.isPending ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang Đồng Bộ...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu Thay Đổi
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
