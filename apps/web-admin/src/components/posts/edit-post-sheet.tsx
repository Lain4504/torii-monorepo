import { useEffect, useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
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
import { Badge } from '@workspace/ui/components/badge';
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
import { Loader2, X, FileText, Save, Calendar, Eye, MessageCircle } from 'lucide-react';
import { postUpdateDTOSchema, PostStatus, type PostUpdateDTO, type PostResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/api/services/storage-api.ts';
import { useUpdatePost } from "@/api/services/post.ts";
import { cn } from '@workspace/ui/lib/utils';

const editPostSchema = postUpdateDTOSchema.omit({
    tags: true,
    publishedAt: true,
}).extend({
    status: z.nativeEnum(PostStatus).optional(),
    tags: z.string().optional(), // String input, will be parsed to array
    publishedAt: z.string().optional(), // ISO date string from datetime-local input
});

type EditPostFormData = z.infer<typeof editPostSchema>;

interface EditPostSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: PostResponseDTO | null;
}

export function EditPostSheet({
    open,
    onOpenChange,
    post,
}: EditPostSheetProps) {
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<EditPostFormData>({
        resolver: zodResolver(editPostSchema),
    });

    const updatePost = useUpdatePost(post?.id || '');

    // Reset form when post changes
    useEffect(() => {
        if (post) {
            // Format publishedAt to datetime-local format (YYYY-MM-DDTHH:mm)
            const publishedAtValue = post.publishedAt
                ? new Date(post.publishedAt).toISOString().slice(0, 16)
                : '';

            reset({
                title: post.title,
                excerpt: post.excerpt || '',
                content: post.content,
                status: post.status,
                tags: post.tags ? post.tags.join(', ') : '',
                publishedAt: publishedAtValue,
            });
            // Set cover image preview if exists
            if (post.coverImageUrl) {
                setCoverImagePreview(post.coverImageUrl);
            } else {
                setCoverImagePreview(null);
            }
            setCoverImageFile(null);
        }
    }, [post, reset]);

    const handleFileUpload = async (file: File, module: string) => {
        try {
            const uploadData = {
                filename: file.name,
                contentType: file.type,
                module,
            };
            const { uploadUrl, fileId } = await storageApi.generateUploadUrl(uploadData);

            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            const confirmResult = await storageApi.confirmUpload({ fileId });
            return confirmResult.fileUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
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

    const handleFormSubmit: SubmitHandler<EditPostFormData> = async (data) => {
        if (!post) return;

        try {
            setUploading(true);
            let coverImageUrl: string | undefined = post.coverImageUrl || undefined;

            if (coverImageFile) {
                coverImageUrl = await handleFileUpload(coverImageFile, 'post-images');
            } else if (!coverImagePreview && post.coverImageUrl) {
                coverImageUrl = undefined;
            }

            const tags = data.tags
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

            const publishedAt = data.publishedAt
                ? new Date(data.publishedAt)
                : undefined;

            const dto: PostUpdateDTO = {
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || undefined,
                status: data.status,
                tags,
                coverImageUrl,
                publishedAt,
            };

            await updatePost.mutateAsync(dto);
            toast.success('Post Updated', {
                description: `Post "${data.title}" successfully updated.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Update Failed', {
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!post) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[900px] sm:max-w-[900px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background">
                <SheetHeader className="px-6 py-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <SheetTitle className="text-xl font-bold text-foreground">
                                    Chỉnh sửa bài viết
                                </SheetTitle>
                                <SheetDescription className="text-sm text-muted-foreground flex items-center gap-2">
                                    ID: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{post.id.substring(0, 8)}</span>
                                </SheetDescription>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "px-2.5 py-0.5 text-xs font-semibold border-transparent",
                                post.status === 'published'
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : post.status === 'draft'
                                        ? "bg-blue-500/10 text-blue-600"
                                        : "bg-muted text-muted-foreground"
                            )}>
                            {post.status === 'published' ? 'Đã xuất bản' : post.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                        </Badge>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 min-h-0">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-6 space-y-8">

                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Eye className="h-4 w-4" />
                                        <span className="text-xs font-medium">Lượt xem</span>
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">
                                        {post.viewCount || 0}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <MessageCircle className="h-4 w-4" />
                                        <span className="text-xs font-medium">Bình luận</span>
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">
                                        {post.commentCount || 0}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-xs font-medium">Cập nhật</span>
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {new Date(post.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-foreground">Thông tin chính</h3>
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name} className="required">Tiêu đề</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="Tiêu đề bài viết"
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
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name}>Mô tả ngắn</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="Tóm tắt nội dung..."
                                                className="min-h-[80px] resize-none"
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
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name} className="required">Nội dung</FieldLabel>
                                            <div className="rounded-md border border-input">
                                                <TiptapEditor
                                                    content={field.value || ''}
                                                    onChange={(html) => field.onChange(html)}
                                                    placeholder="Nội dung bài viết..."
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
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor={field.name}>Trạng thái</FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as PostStatus)}
                                                >
                                                    <SelectTrigger id={field.name} className="h-10">
                                                        <SelectValue placeholder="Chọn trạng thái" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={PostStatus.DRAFT}>Bản nháp</SelectItem>
                                                        <SelectItem value={PostStatus.PUBLISHED}>Đã xuất bản</SelectItem>
                                                        <SelectItem value={PostStatus.ARCHIVED}>Đã lưu trữ</SelectItem>
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
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor={field.name}>Ngày xuất bản</FieldLabel>
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
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="Thẻ bài viết (ngăn cách bởi dấu phẩy)"
                                                className="h-10"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                {/* Media Upload */}
                                <div className="space-y-6 pt-6">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold text-foreground">Hình ảnh & Media</h3>
                                        <Separator />
                                    </div>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="cover-image-upload">Ảnh bìa</FieldLabel>
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
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {(coverImagePreview || coverImageFile) && (
                                                <div className="relative rounded-lg overflow-hidden border border-border/50 aspect-video w-full max-w-sm">
                                                    <img
                                                        src={coverImagePreview || URL.createObjectURL(coverImageFile!)}
                                                        alt="Preview"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                </div>


                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="px-6 py-4 bg-background border-t border-border flex flex-row items-center justify-between gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-10 px-6"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || (!isDirty && !coverImageFile)}
                            className="h-10 px-8 bg-primary text-primary-foreground font-semibold shadow-sm hover:translate-y-0"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang đồng bộ...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
