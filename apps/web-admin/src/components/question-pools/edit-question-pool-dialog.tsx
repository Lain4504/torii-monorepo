import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2 } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateQuestionPool, useQuestionPool } from '@/api/services/question-pools.ts';
import { useCourses } from '@/api/services/courses.ts';
import {
    QuestionJlptLevel,
    questionPoolUpdateDTOSchema,
    type QuestionPoolUpdateDTO,
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
    const selectedCourse = coursesData?.data.find(c => c.id === selectedCourseId);

    useEffect(() => {
        if (pool) {
            reset({
                name: pool.name,
                description: pool.description || '',
                courseId: pool.courseId || undefined,
                lessonId: pool.lessonId || undefined,
                jlptLevel: pool.jlptLevel || undefined,
            });
        }
    }, [pool, reset]);

    const onSubmit = async (data: UpdateQuestionPoolFormData) => {
        if (!pool) return;

        try {
            await updatePool.mutateAsync({ id: pool.id, pool: data });
            toast.success('Question pool updated successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update question pool');
        }
    };

    if (!pool) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-8 pb-4 bg-muted/30">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Edit Question Pool
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-6">
                    <Controller
                        name="name"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Pool Name *</FieldLabel>
                                <Input
                                    {...field}
                                    placeholder="Enter pool name..."
                                    className="bg-background/50 border-border/40"
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                    {...field}
                                    placeholder="Enter pool description..."
                                    className="min-h-[100px] bg-background/50 border-border/40"
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="courseId"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Course (Optional)</FieldLabel>
                                    <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                        <SelectTrigger className="bg-background/50 border-border/40">
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {coursesData?.data.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="jlptLevel"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>JLPT Level (Optional)</FieldLabel>
                                    <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                        <SelectTrigger className="bg-background/50 border-border/40">
                                            <SelectValue placeholder="Select JLPT level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N5}>N5</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N4}>N4</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N3}>N3</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N2}>N2</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N1}>N1</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    </div>

                    {selectedCourse && (
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Selected Course:</span> {selectedCourse.title}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updatePool.isPending}>
                            {updatePool.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Pool
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

