import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { TiptapEditor } from '@workspace/ui/components/tiptap-editor';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
    FieldSet,
    FieldLegend,
    FieldDescription,
    FieldSeparator,
} from '@workspace/ui/components/field';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Calendar } from '@workspace/ui/components/calendar';
import { format } from 'date-fns';
import { UploadCloud, X, CalendarIcon } from 'lucide-react';
import { BlogStatus, type BlogCreateDTO } from '@workspace/schemas';
import { useCreateBlog } from '@/lib/api/services/blog.ts';
import { toast } from '@workspace/ui/components/sonner';
import { useAppSelector } from '@/hooks/hooks.ts';
import { selectUser } from '@/store/slices/auth-slice.ts';
import { storageApi } from '@/lib/api/services/storage-api.ts';
import { Spinner } from "@workspace/ui/components/spinner";

const createBlogSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    content: z.string().min(1, 'Nội dung là bắt buộc'),
    excerpt: z.string().optional(),
    status: z.nativeEnum(BlogStatus).optional(),
    tags: z.string().optional(),
    publishedAt: z.date().optional(),
    publishedTime: z.string().optional(),
}).refine(
    (data) => {
        if (data.status === BlogStatus.SCHEDULED) {
            return !!data.publishedAt;
        }
        return true;
    },
    {
        message: 'Ngày đăng là bắt buộc khi trạng thái là "Đã lên lịch"',
        path: ['publishedAt'],
    }
).refine(
    (data) => {
        if (data.status === BlogStatus.SCHEDULED && data.publishedAt) {
            const now = new Date();
            const publishedDateTime = new Date(data.publishedAt);
            if (data.publishedTime) {
                const [hours, minutes] = data.publishedTime.split(':').map(Number);
                publishedDateTime.setHours(hours, minutes);
            }
            return publishedDateTime > now;
        }
        return true;
    },
    {
        message: 'Ngày đăng phải là một ngày trong tương lai',
        path: ['publishedAt'],
    }
);

type CreateBlogFormData = z.infer<typeof createBlogSchema>;

interface CreateBlogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBlogSheet({
    open,
    onOpenChange,
}: CreateBlogDialogProps) {
    const user = useAppSelector(selectUser);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<CreateBlogFormData>({
        resolver: zodResolver(createBlogSchema),
        defaultValues: {
            title: '',
            content: '',
            excerpt: '',
            status: BlogStatus.DRAFT,
            tags: '',
            publishedAt: undefined,
            publishedTime: '00:00',
        },
    });

    const createBlog = useCreateBlog();

    const handleFileUpload = async (file: File, module: string) => {
        try {
            const uploadData = {
                filename: file.name,
                contentType: file.type,
                module,
            };
            const { uploadUrl, fileId } = await storageApi.generateUploadUrl(uploadData);

            // Upload file to presigned URL
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
                mode: 'cors',
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text().catch(() => 'Lỗi không xác định');
                throw new Error(`Tải lên thất bại với mã lỗi ${uploadResponse.status}: ${errorText}`);
            }

            // Confirm upload
            const confirmResult = await storageApi.confirmUpload({ fileId });
            return confirmResult.fileUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi tải lên không xác định';
            throw new Error(`Không thể tải lên file: ${errorMessage}`);
        }
    };

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeCoverImage = () => {
        setCoverImageFile(null);
        setCoverImagePreview(null);
    };

    const handleFormSubmit: SubmitHandler<CreateBlogFormData> = async (data) => {
        if (!user?.id) {
            toast.error('User not found');
            return;
        }

        try {
            setUploading(true);
            let coverImageUrl: string | undefined = undefined;

            // Upload cover image if selected
            if (coverImageFile) {
                coverImageUrl = await handleFileUpload(coverImageFile, 'blog-images');
            }

            // Parse tags from comma-separated string
            const tags = data.tags
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

            // Parse publishedAt date and combine with publishedTime if provided
            let publishedAt = data.publishedAt;
            if (publishedAt && data.publishedTime) {
                const [hours, minutes] = data.publishedTime.split(':').map(Number);
                publishedAt = new Date(publishedAt);
                publishedAt.setHours(hours, minutes, 0, 0);
            }

            const dto: BlogCreateDTO = {
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || undefined,
                status: data.status || BlogStatus.DRAFT,
                authorId: user.id,
                tags,
                coverImageUrl,
                publishedAt,
            };

            await createBlog.mutateAsync(dto);
            toast.success('Đã tạo bài viết', {
                description: 'Cấu trúc bài viết đã được tạo. Giờ có thể xuất bản nội dung.',
            });
            handleClose();
        } catch (error: any) {
            toast.error('Tạo bài viết thất bại', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            onOpenChange(false);
            reset();
            setCoverImageFile(null);
            setCoverImagePreview(null);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Tạo bài viết mới</SheetTitle>
                    <SheetDescription>
                        Điền thông tin chi tiết để tạo bài viết mới.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full overflow-hidden" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-6">
                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Thông tin chung</FieldLegend>
                                    <FieldDescription>Cung cấp các thông tin cơ bản cho bài viết.</FieldDescription>

                                    <FieldGroup>
                                        <Controller
                                            control={control}
                                            name="title"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name} className="required">
                                                        Tiêu đề bài viết
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        {...field}
                                                        placeholder="Nhập tiêu đề bài viết..."
                                                        autoComplete="off"
                                                    />
                                                    <FieldError errors={[fieldState.error]} />
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            control={control}
                                            name="excerpt"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name}>
                                                        Mô tả ngắn
                                                    </FieldLabel>
                                                    <Textarea
                                                        id={field.name}
                                                        {...field}
                                                        value={field.value || ''}
                                                        placeholder="Tóm tắt nội dung bài viết..."
                                                        rows={3}
                                                        className="resize-none"
                                                    />
                                                    <FieldError errors={[fieldState.error]} />
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            control={control}
                                            name="content"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name} className="required">
                                                        Nội dung chi tiết
                                                    </FieldLabel>
                                                    <div className="rounded-md border border-input overflow-hidden">
                                                        <TiptapEditor
                                                            content={field.value || ''}
                                                            onChange={(html: string) => field.onChange(html)}
                                                            placeholder="Viết nội dung bài viết..."
                                                            ariaInvalid={fieldState.invalid}
                                                            className="min-h-[400px] border-none focus-visible:ring-0"
                                                            showCharacterCount={true}
                                                            mode="admin"
                                                        />
                                                    </div>
                                                    <FieldError errors={[fieldState.error]} />
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>
                                </FieldSet>

                                <FieldSeparator />

                                <FieldSet>
                                    <FieldLegend>Phân loại & Xuất bản</FieldLegend>
                                    <FieldDescription>Thiết lập trạng thái và thời gian hiển thị bài viết.</FieldDescription>

                                    <FieldGroup className="grid grid-cols-2 gap-6">
                                        <Controller
                                            control={control}
                                            name="status"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name}>
                                                        Trạng thái
                                                    </FieldLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => field.onChange(value as BlogStatus)}
                                                    >
                                                        <SelectTrigger id={field.name}>
                                                            <SelectValue placeholder="Chọn trạng thái" />
                                                        </SelectTrigger>
                                                        <SelectContent>
<SelectItem value={BlogStatus.DRAFT}>Bản nháp</SelectItem>
<SelectItem value={BlogStatus.PUBLISHED}>Đã xuất bản</SelectItem>
<SelectItem value={BlogStatus.SCHEDULED}>Đã lên lịch</SelectItem>
<SelectItem value={BlogStatus.ARCHIVED}>Đã lưu trữ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FieldError errors={[fieldState.error]} />
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            control={control}
                                            name="publishedAt"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name}>
                                                        Ngày đăng
                                                    </FieldLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? format(field.value, "PP") : <span>Chọn ngày</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FieldError errors={[fieldState.error]} />
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            control={control}
                                            name="publishedTime"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name}>
                                                        Giờ đăng
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        type="time"
                                                        {...field}
                                                        className="w-full"
                                                    />
                                                    <FieldError errors={[fieldState.error]} />
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>

                                    <Controller
                                        control={control}
                                        name="tags"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Tags
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder="Ví dụ: Blog, Tin tức, Hướng dẫn (ngăn cách bởi dấu phẩy)"
                                                />
                                                <FieldDescription>Cách nhau bởi dấu phẩy.</FieldDescription>
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />
                                </FieldSet>

                                <FieldSeparator />

                                <FieldSet>
                                    <FieldLegend>Hình ảnh & Media</FieldLegend>
                                    <FieldDescription>Tải lên ảnh bìa cho bài viết để thu hút người đọc.</FieldDescription>

                                    <Field>
                                        <FieldLabel htmlFor="cover-image-upload">
                                            Ảnh bìa
                                        </FieldLabel>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    id="cover-image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleCoverImageChange}
                                                    className="pt-2 file:text-foreground"
                                                />
                                                {coverImageFile && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={removeCoverImage}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {(coverImagePreview || coverImageFile) && (
                                                <div className="relative rounded-lg overflow-hidden border border-border/50 aspect-video w-full max-w-sm">
                                                    <img
                                                        src={coverImagePreview || ''}
                                                        alt="Bản xem trước"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                </FieldSet>
                            </FieldGroup>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <SheetFooter>
                        <Button
                            type="submit"
                            disabled={uploading || createBlog.isPending}>
                            {uploading || createBlog.isPending ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Tạo bài viết
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}>
                            Hủy bỏ
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
