import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2, Save, Info } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateQuestionPool } from '@/api/services/question-pools.ts';
import { useCourses } from '@/api/services/courses.ts';
import {
    QuestionJlptLevel,
    questionPoolUpdateDTOSchema,
    type QuestionPoolResponseDTO,
} from '@workspace/schemas';
import type { z } from 'zod';

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
            courseId: undefined,
            lessonId: undefined,
            jlptLevel: undefined,
        },
    });

    const selectedCourseId = watch('courseId');
    const selectedCourse = coursesData?.data?.find(c => c.id === selectedCourseId);

    useEffect(() => {
        if (pool) {
            reset({
                name: pool.name,
                description: pool.description || '',
                courseId: pool.courseId || undefined,
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[800px] !max-w-[800px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background [&>button]:top-6 [&>button]:right-6 [&>button]:bg-background/20 [&>button]:rounded-xl [&>button]:w-10 [&>button]:h-10">
                <SheetHeader className="px-6 py-6 border-b border-border/10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                <Save className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-xl font-bold tracking-tight">
                                    Chỉnh Sửa Kho Đề
                                </SheetTitle>
                                <p className="text-xs font-medium text-muted-foreground/60">
                                    ID: <span className="font-mono">{pool.id.substring(0, 8)}...</span>
                                </p>
                            </div>
                        </div>
                        <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
                            Cập nhật lại tiêu đề, mô tả hoặc thay đổi các liên kết của kho đề câu hỏi.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-8 py-8 space-y-8">
                            <div className="space-y-6">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2">
                                            <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Tên Kho Đề *</FieldLabel>
                                            <Input
                                                {...field}
                                                placeholder="VD: Từ vựng N5 - Bài 1"
                                                className="h-12 px-4 rounded-xl bg-background border-border hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                                            />
                                            {fieldState.error && <FieldError className="text-xs font-medium text-destructive ml-1 mt-1.5">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2">
                                            <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Mô Tả Tóm Tắt</FieldLabel>
                                            <Textarea
                                                {...field}
                                                placeholder="Nhập mô tả cụ thể cho kho đề..."
                                                className="min-h-[120px] p-4 rounded-xl bg-background border-border hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-sm resize-none"
                                            />
                                            {fieldState.error && <FieldError className="text-xs font-medium text-destructive ml-1 mt-1.5">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        name="courseId"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Khóa Học Liên Kết</FieldLabel>
                                                <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                                    <SelectTrigger className="h-12 px-4 rounded-xl bg-background border-border hover:bg-muted/30 transition-all text-sm font-medium">
                                                        <SelectValue placeholder="Chọn khóa học" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-border shadow-2xl p-1 max-h-[250px]">
                                                        <SelectItem value="none" className="rounded-lg text-xs italic text-muted-foreground/60">Không chỉ định</SelectItem>
                                                        {coursesData?.data?.map((course) => (
                                                            <SelectItem key={course.id} value={course.id} className="rounded-lg text-xs font-medium">
                                                                {course.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FieldError className="text-xs font-medium text-destructive ml-1 mt-1.5">{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="jlptLevel"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Cấp Độ JLPT</FieldLabel>
                                                <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                                    <SelectTrigger className="h-12 px-4 rounded-xl bg-background border-border hover:bg-muted/30 transition-all text-sm font-medium">
                                                        <SelectValue placeholder="Chọn JLPT" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-border shadow-2xl p-1">
                                                        <SelectItem value="none" className="rounded-lg text-xs italic text-muted-foreground/60">Không chỉ định</SelectItem>
                                                        {[QuestionJlptLevel.N1, QuestionJlptLevel.N2, QuestionJlptLevel.N3, QuestionJlptLevel.N4, QuestionJlptLevel.N5].map(level => (
                                                            <SelectItem key={level} value={level} className="rounded-lg text-xs font-medium">{level}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FieldError className="text-xs font-medium text-destructive ml-1 mt-1.5">{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                </div>

                                {selectedCourse && (
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                            <Info className="size-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Khóa học hiện tại</p>
                                            <p className="text-sm text-foreground font-bold leading-tight">{selectedCourse.title}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="p-6 border-t border-border/10 bg-muted/5 flex-row justify-end space-x-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={updatePool.isPending}
                            className="h-11 px-8 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            {updatePool.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang Đồng Bộ...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu Thay Đổi
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
