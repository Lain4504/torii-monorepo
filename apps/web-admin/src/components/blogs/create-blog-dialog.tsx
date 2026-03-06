import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
    FieldSet,
} from '@workspace/ui/components/field';
import { X } from 'lucide-react';
import { BlogStatus, type BlogCreateDTO } from '@workspace/schemas';
import { useCreateBlog } from '@/lib/api/services/blog.ts';
import { toast } from '@workspace/ui/components/sonner';
import { useAppSelector } from '@/hooks/hooks.ts';
import { selectUser } from '@/store/slices/auth-slice.ts';
import { storageApi } from '@/lib/api/services/storage-api.ts';
import { Spinner } from "@workspace/ui/components/spinner";
import { useNavigate } from 'react-router-dom';

const createBlogSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    excerpt: z.string().optional(),
});

type CreateBlogFormData = z.infer<typeof createBlogSchema>;

interface CreateBlogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBlogDialog({
    open,
    onOpenChange,
}: CreateBlogDialogProps) {
    const user = useAppSelector(selectUser);
    const navigate = useNavigate();
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
            excerpt: '',
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

            if (coverImageFile) {
                coverImageUrl = await handleFileUpload(coverImageFile, 'blog-images');
            }

            const dto: BlogCreateDTO = {
                title: data.title,
                content: '<p></p>', // Default empty content
                excerpt: data.excerpt || undefined,
                status: BlogStatus.DRAFT,
                authorId: user.id,
                coverImageUrl,
            };

            const createdBlog = await createBlog.mutateAsync(dto);
            toast.success('Đã tạo bài viết dạng nháp', {
                description: 'Đang chuyển hướng đến trang biên tập...',
            });
            handleClose();
            // Redirect to edit page
            navigate(`/blogs/${createdBlog.id}/edit`);
        } catch (error: any) {
            toast.error('Tạo bài viết thất bại', {
                description: error.response?.data?.message || error.userMessage || error.message,
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
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Tạo bài viết mới</DialogTitle>
                    <DialogDescription>
                        Cung cấp thông tin cơ bản cho bài viết. Bạn sẽ thêm nội dung ở bước tiếp theo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
                    <FieldGroup>
                        <FieldSet>
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

                                <Field>
                                    <FieldLabel htmlFor="cover-image-upload">
                                        Ảnh bìa (Tùy chọn)
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
                                            <div className="relative rounded-lg overflow-hidden border border-border/50 aspect-video w-full">
                                                <img
                                                    src={coverImagePreview || ''}
                                                    alt="Bản xem trước"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || createBlog.isPending}>
                            {uploading || createBlog.isPending ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang tạo...
                                </>
                            ) : (
                                'Tiếp tục'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
