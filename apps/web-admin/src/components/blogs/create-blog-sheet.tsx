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
import { Separator } from '@workspace/ui/components/separator';
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
} from '@workspace/ui/components/field';
import { Loader2, UploadCloud, X, FileText } from 'lucide-react';
import { BlogStatus, type BlogCreateDTO } from '@workspace/schemas';
import { useCreateBlog } from '@/api/services/blog.ts';
import { toast } from '@workspace/ui/components/sonner';
import { useAppSelector } from '@/hooks/hooks.ts';
import { selectUser } from '@/store/slices/auth-slice.ts';
import { storageApi } from '@/api/services/storage-api.ts';

const createBlogSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    excerpt: z.string().optional(),
    status: z.nativeEnum(BlogStatus).optional(),
    tags: z.string().optional(), // String input, will be parsed to array
    publishedAt: z.string().optional(), // ISO date string from datetime-local input
});

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
            publishedAt: '',
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

            // Parse publishedAt date if provided
            const publishedAt = data.publishedAt
                ? new Date(data.publishedAt)
                : undefined;

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
            <SheetContent className="w-full sm:w-[800px] !max-w-[800px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background">
                <SheetHeader className="px-6 py-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <SheetTitle className="text-xl font-bold text-foreground">
                                Tạo bài viết mới
                            </SheetTitle>
                            <SheetDescription className="text-sm text-muted-foreground">
                                Điền thông tin chi tiết để tạo bài viết mới.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 min-h-0">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-6 space-y-8">
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-foreground">Thông tin chung</h3>
                                    <Separator />
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name} className="required">
                                                Tiêu đề bài viết
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập tiêu đề bài viết..."
                                                className="h-10"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="excerpt"
                                    render={({ field, fieldState }) => (
                                        <Field>
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
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="content"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name} className="required">
                                                Nội dung chi tiết
                                            </FieldLabel>
                                            <div className="rounded-md border border-input">
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
                                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="status"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel htmlFor={field.name}>
                                                    Trạng thái
                                                </FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as BlogStatus)}
                                                >
                                                    <SelectTrigger id={field.name} className="h-10">
                                                        <SelectValue placeholder="Chọn trạng thái" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={BlogStatus.DRAFT}>Bản nháp</SelectItem>
                                                        <SelectItem value={BlogStatus.PUBLISHED}>Đã xuất bản</SelectItem>
                                                        <SelectItem value={BlogStatus.ARCHIVED}>Đã lưu trữ</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="publishedAt"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel htmlFor={field.name}>
                                                    Ngày xuất bản
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="h-10 font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    control={control}
                                    name="tags"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>
                                                Tags
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="Ví dụ: Blog, Tin tức, Hướng dẫn (ngăn cách bởi dấu phẩy)"
                                                className="h-10"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* Media Files */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-foreground">Hình ảnh & Media</h3>
                                    <Separator />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="cover-image-upload">
                                        Ảnh bìa
                                    </FieldLabel>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="cover-image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleCoverImageChange}
                                                    className="h-10 pt-2 file:text-foreground"
                                                />
                                            </div>
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
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <SheetFooter>
                        <Button
                            type="submit"
                            disabled={uploading || createBlog.isPending}>
                            {uploading || createBlog.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
