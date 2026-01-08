import { useEffect, useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
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
import { Loader2, Upload, X } from 'lucide-react';
import { blogPostUpdateDTOSchema, BlogPostStatus, type BlogPostUpdateDTO, type BlogPostResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/api/services/storage-api.ts';
import { useUpdateBlog } from "@/api/services/blog.ts";

const editBlogSchema = blogPostUpdateDTOSchema.omit({
    tags: true,
    publishedAt: true,
}).extend({
    status: z.nativeEnum(BlogPostStatus).optional(),
    tags: z.string().optional(), // String input, will be parsed to array
    publishedAt: z.string().optional(), // ISO date string from datetime-local input
});

type EditBlogFormData = z.infer<typeof editBlogSchema>;

interface EditBlogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog: BlogPostResponseDTO | null;
}

export function EditBlogDialog({
    open,
    onOpenChange,
    blog,
}: EditBlogDialogProps) {
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<EditBlogFormData>({
        resolver: zodResolver(editBlogSchema),
    });

    const updateBlog = useUpdateBlog();

    // Reset form when blog changes
    useEffect(() => {
        if (blog) {
            // Format publishedAt to datetime-local format (YYYY-MM-DDTHH:mm)
            const publishedAtValue = blog.publishedAt
                ? new Date(blog.publishedAt).toISOString().slice(0, 16)
                : '';

            reset({
                title: blog.title,
                excerpt: blog.excerpt || '',
                content: blog.content,
                status: blog.status,
                tags: blog.tags ? blog.tags.join(', ') : '',
                seoTitle: blog.seoTitle || '',
                seoDescription: blog.seoDescription || '',
                publishedAt: publishedAtValue,
            });
            // Set cover image preview if exists
            if (blog.coverImageUrl) {
                setCoverImagePreview(blog.coverImageUrl);
            } else {
                setCoverImagePreview(null);
            }
            setCoverImageFile(null);
        }
    }, [blog, reset]);

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
                const errorText = await uploadResponse.text().catch(() => 'Unknown error');
                throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
            }

            // Confirm upload
            const confirmResult = await storageApi.confirmUpload({ fileId });
            return confirmResult.fileUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
            throw new Error(`Failed to upload file: ${errorMessage}`);
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

    const handleFormSubmit: SubmitHandler<EditBlogFormData> = async (data) => {
        if (!blog) return;

        try {
            setUploading(true);
            let coverImageUrl: string | undefined = blog.coverImageUrl || undefined;

            // Upload new cover image if selected
            if (coverImageFile) {
                coverImageUrl = await handleFileUpload(coverImageFile, 'BLOG');
            } else if (!coverImagePreview && blog.coverImageUrl) {
                // If preview was removed, clear the cover image
                coverImageUrl = undefined;
            }

            // Parse tags from comma-separated string
            const tags = data.tags
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

            // Parse publishedAt date if provided
            const publishedAt = data.publishedAt
                ? new Date(data.publishedAt)
                : undefined;

            const dto: BlogPostUpdateDTO = {
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || undefined,
                status: data.status,
                tags,
                coverImageUrl,
                seoTitle: data.seoTitle || undefined,
                seoDescription: data.seoDescription || undefined,
                publishedAt,
            };

            await updateBlog.mutateAsync({ id: blog.id, blog: dto });
            toast.success('Blog post updated successfully!');
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to update blog post', {
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!blog) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Blog Post</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
                    {/* Cover Image */}
                    <Field className="space-y-2">
                        <FieldLabel>Cover Image</FieldLabel>
                        {coverImagePreview ? (
                            <div className="relative">
                                <img
                                    src={coverImagePreview}
                                    alt="Cover preview"
                                    className="w-full h-48 object-cover rounded-lg border"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={removeCoverImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                {!coverImageFile && (
                                    <div className="absolute bottom-2 left-2">
                                        <FieldLabel htmlFor="cover-image-edit" className="cursor-pointer">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                asChild
                                            >
                                                <span>Change Image</span>
                                            </Button>
                                            <Input
                                                id="cover-image-edit"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleCoverImageChange}
                                            />
                                        </FieldLabel>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed rounded-lg p-6">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <FieldLabel htmlFor="cover-image-edit" className="cursor-pointer">
                                        <span className="text-sm text-muted-foreground">
                                            Click to upload cover image
                                        </span>
                                        <Input
                                            id="cover-image-edit"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleCoverImageChange}
                                        />
                                    </FieldLabel>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG or GIF. Max 5MB
                                    </p>
                                </div>
                            </div>
                        )}
                    </Field>

                    {/* Title */}
                    <Controller
                        control={control}
                        name="title"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Title <span className="text-destructive">*</span></FieldLabel>
                                <Input
                                    id={field.name}
                                    placeholder="Enter blog post title"
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {/* Excerpt */}
                    <Controller
                        control={control}
                        name="excerpt"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Excerpt</FieldLabel>
                                <Textarea
                                    id={field.name}
                                    placeholder="Short description of the post"
                                    {...field}
                                    value={field.value || ''}
                                    rows={3}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {/* Content */}
                    <Controller
                        control={control}
                        name="content"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Content <span className="text-destructive">*</span></FieldLabel>
                                <Textarea
                                    id={field.name}
                                    placeholder="Write your blog post content here..."
                                    {...field}
                                    rows={10}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {/* Status */}
                    <Controller
                        control={control}
                        name="status"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => field.onChange(value as BlogPostStatus)}
                                >
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={BlogPostStatus.DRAFT}>Draft</SelectItem>
                                        <SelectItem value={BlogPostStatus.PUBLISHED}>Published</SelectItem>
                                        <SelectItem value={BlogPostStatus.ARCHIVED}>Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {/* Tags */}
                    <Controller
                        control={control}
                        name="tags"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                                <Input
                                    id={field.name}
                                    placeholder="Enter tags separated by commas (e.g., tech, programming, tutorial)"
                                    {...field}
                                    value={field.value || ''}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {/* Published At */}
                    <Controller
                        control={control}
                        name="publishedAt"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Published At</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="datetime-local"
                                    {...field}
                                    value={field.value || ''}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {/* SEO Title */}
                    <Controller
                        control={control}
                        name="seoTitle"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>SEO Title</FieldLabel>
                                <Input
                                    id={field.name}
                                    placeholder="Enter SEO title (optional)"
                                    {...field}
                                    value={field.value || ''}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {/* SEO Description */}
                    <Controller
                        control={control}
                        name="seoDescription"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>SEO Description</FieldLabel>
                                <Textarea
                                    id={field.name}
                                    placeholder="Enter SEO description (optional)"
                                    {...field}
                                    value={field.value || ''}
                                    rows={3}
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateBlog.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateBlog.isPending || uploading}>
                            {(updateBlog.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {(updateBlog.isPending || uploading) ? 'Updating...' : 'Update Post'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

