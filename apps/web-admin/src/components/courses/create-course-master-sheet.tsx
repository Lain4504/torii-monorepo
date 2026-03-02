import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@workspace/ui/components/sheet';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { X, UploadCloud } from 'lucide-react';

import { toast } from '@workspace/ui/components/sonner';
import { JlptLevel, courseMasterCreateDTOSchema, type CourseMasterCreateDTO } from '@workspace/schemas';
import { useCreateCourse } from "@/lib/api/services/courses.ts";
import { Spinner } from "@workspace/ui/components/spinner";

interface CreateCourseMasterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCourseMasterSheet({ open, onOpenChange }: CreateCourseMasterSheetProps) {
    const [uploading, setUploading] = useState(false);

    const createMutation = useCreateCourse();

    const {
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
    } = useForm<CourseMasterCreateDTO>({
        resolver: zodResolver(courseMasterCreateDTOSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            shortDescription: '',
            jlptLevel: undefined,
            thumbnailUrl: undefined,
            previewVideoUrl: undefined,
            type: 'vod',
            durationWeeks: undefined,
            tags: [],
            learningOutcomes: [],
            requirements: [],
        },
    });

    const courseType = watch('type');

    const handleClose = () => {
        if (!uploading) {
            onOpenChange(false);
            reset();
        }
    };

    const onSubmit = async (data: CourseMasterCreateDTO) => {
        setUploading(true);
        try {
            await createMutation.mutateAsync({
                ...data,
                durationWeeks: (data.durationWeeks as any) === '' || isNaN(data.durationWeeks as any) ? undefined : data.durationWeeks,
                tags: data.tags && data.tags.length ? data.tags : undefined,
                learningOutcomes: data.learningOutcomes && (data.learningOutcomes as any[]).length ? data.learningOutcomes : [],
                requirements: data.requirements && (data.requirements as any[]).length ? data.requirements : [],
            });

            toast.success('Đã tạo khung chương trình', {
                description: 'Khung chương trình mới đã được tạo thành công.',
            });
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Tạo thất bại', {
                description: 'Đã xảy ra lỗi khi tạo khung chương trình. Vui lòng thử lại.',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Tạo Khung chương trình mới</SheetTitle>
                    <SheetDescription>
                        Nhập thông tin chi tiết cho khung chương trình (Syllabus) mới.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                    <div className="h-px flex-1 bg-border/20 min-h-0" />
                                    <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                        Thông Tin Cơ Bản
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20 min-h-0" />
                                </div>

                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Tên Khung chương trình <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập tên khung chương trình..."
                                                className="mt-1"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Mô Tả <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập mô tả chi tiết khóa học..."
                                                rows={4}
                                                className="mt-1 resize-none"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        name="jlptLevel"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Trình Độ JLPT
                                                </FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="mt-1" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="Chọn Trình Độ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(JlptLevel).map((level) => (
                                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        name="shortDescription"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Mô Tả Ngắn
                                                </FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    {...field}
                                                    placeholder="Tóm tắt ngắn gọn hiển thị trên thẻ..."
                                                    rows={3}
                                                    className="mt-1 resize-none"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="type"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Loại Khóa Học
                                                </FieldLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="Chọn loại khóa học" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="vod">Video theo yêu cầu (VOD)</SelectItem>
                                                        <SelectItem value="live">Phát trực tiếp</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        name="durationWeeks"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Thời Lượng (Tuần)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    min="0"
                                                    max="26"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                    placeholder="Tối đa 26 tuần (6 tháng)"
                                                    className="mt-1 font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <p className="text-[10px] text-muted-foreground/60 mt-1.5 ml-1">
                                                    Thời lượng nội dung chương trình học.
                                                </p>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                {courseType === 'vod' && (
                                    <Controller
                                        name="expirationMonths"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Thời Hạn Truy Cập (Tháng)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    min="1"
                                                    max="6"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                    placeholder="1-6 tháng (mặc định 6)"
                                                    className="mt-1 font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <p className="text-[10px] text-muted-foreground/60 mt-1.5 ml-1 leading-relaxed">
                                                    Hạn truy cập mặc định cho mô hình "Mua cả khóa". <br />
                                                    Học viên cần gia hạn nếu muốn xem lại sau thời gian này.
                                                </p>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                )}

                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                        <div className="h-px flex-1 bg-border/20 min-h-0" />
                                        <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                            Chương Trình Học
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20 min-h-0" />
                                    </div>

                                    <Controller
                                        name="tags"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Thẻ (Tags)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={(field.value || []).join(', ')}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split(',')
                                                                .map((t) => t.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="ví dụ: JLPT, Ngữ pháp, Sơ cấp (phân cách bằng dấu phẩy)"
                                                    className="mt-1"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="learningOutcomes"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Mục Tiêu Khóa Học
                                                </FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split('\n')
                                                                .map((line) => line.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="Nhập mỗi mục tiêu một dòng..."
                                                    rows={4}
                                                    className="mt-1 resize-none"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="requirements"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Yêu Cầu
                                                </FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split('\n')
                                                                .map((line) => line.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="Nhập mỗi yêu cầu một dòng..."
                                                    rows={4}
                                                    className="mt-1 resize-none"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}>
                            <X className="mr-2 h-3.5 w-3.5" />
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading}>
                            {uploading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Tạo Khung chương trình
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
