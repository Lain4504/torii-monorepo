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
            toast.success('Thành công', {
                description: 'Đã cập nhật thông tin kho đề câu hỏi.'
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Thất bại', {
                description: error.response?.data?.message || 'Không thể cập nhật kho đề lúc này.'
            });
        }
    };

    if (!pool) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Chỉnh sửa Kho đề</SheetTitle>
                    <SheetDescription>
                        Cập nhật các thông tin và thuộc tính liên kết của kho đề.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
                    <div className="p-6 space-y-6">
                        <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Tên Kho đề *</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Nhập tên kho đề..."
                                        className="h-10 rounded-xl bg-background border-border hover:border-primary/50 transition-all text-sm"
                                    />
                                    {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Mô tả tóm tắt</FieldLabel>
                                    <Textarea
                                        {...field}
                                        placeholder="Nhập mô tả cho kho đề..."
                                        className="min-h-[100px] rounded-xl bg-background border-border hover:border-primary/50 transition-all text-sm resize-none"
                                    />
                                    {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="courseId"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Khóa học liên kết</FieldLabel>
                                        <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                            <SelectTrigger className="h-10 rounded-xl bg-background border-border hover:border-primary/50 transition-all text-sm">
                                                <SelectValue placeholder="Chọn khóa học" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl p-1 max-h-[250px]">
                                                <SelectItem value="none" className="rounded-lg text-sm cursor-pointer italic text-muted-foreground/60">Không chỉ định</SelectItem>
                                                {coursesData?.data?.map((course) => (
                                                    <SelectItem key={course.id} value={course.id} className="rounded-lg text-sm cursor-pointer">
                                                        {course.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="jlptLevel"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Cấp độ JLPT</FieldLabel>
                                        <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                            <SelectTrigger className="h-10 rounded-xl bg-background border-border hover:border-primary/50 transition-all text-sm">
                                                <SelectValue placeholder="Chọn cấp độ JLPT" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl p-1">
                                                <SelectItem value="none" className="rounded-lg text-sm cursor-pointer italic text-muted-foreground/60">Không chỉ định</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N1} className="rounded-lg text-sm cursor-pointer">N1</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N2} className="rounded-lg text-sm cursor-pointer">N2</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N3} className="rounded-lg text-sm cursor-pointer">N3</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N4} className="rounded-lg text-sm cursor-pointer">N4</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N5} className="rounded-lg text-sm cursor-pointer">N5</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        </div>

                        {selectedCourse && (
                            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
                                <Info className="size-4 text-primary mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Khóa học hiện tại</p>
                                    <p className="text-sm text-foreground font-medium">{selectedCourse.title}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <SheetFooter>
                        <Button type="submit" disabled={updatePool.isPending}>
                            {updatePool.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
