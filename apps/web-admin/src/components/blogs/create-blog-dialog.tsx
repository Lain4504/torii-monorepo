import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
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
import { Label } from '@workspace/ui/components/label';
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
import { PostStatus, type PostCreateDTO } from '@workspace/schemas';
import { useCreateBlog } from '@/api/services/blog.ts';
import { toast } from '@workspace/ui/components/sonner';
import { useAppSelector } from '@/hooks/hooks.ts';
import { selectUser } from '@/store/slices/auth-slice.ts';
import { storageApi } from '@/api/services/storage-api.ts';

const createBlogSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    excerpt: z.string().optional(),
    status: z.nativeEnum(PostStatus).optional(),
    tags: z.string().optional(), // String input, will be parsed to array
    publishedAt: z.string().optional(), // ISO date string from datetime-local input
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
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
            status: PostStatus.DRAFT,
            tags: '',
            seoTitle: '',
            seoDescription: '',
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
                coverImageUrl = await handleFileUpload(coverImageFile, 'BLOG');
            }

            // Parse tags from comma-separated string
            const tags = data.tags
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

            // Parse publishedAt date if provided
            const publishedAt = data.publishedAt
                ? new Date(data.publishedAt)
                : undefined;

            const dto: PostCreateDTO = {
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || undefined,
                status: data.status || PostStatus.DRAFT,
                authorId: user.id,
                tags,
                coverImageUrl,
                seoTitle: data.seoTitle || undefined,
                seoDescription: data.seoDescription || undefined,
                publishedAt,
            };

            await createBlog.mutateAsync(dto);
            toast.success('Blog post created successfully!');
            reset();
            setCoverImageFile(null);
            setCoverImagePreview(null);
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to create blog post', {
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
            setCoverImageFile(null);
            setCoverImagePreview(null);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Blog Post</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Cover Image - Full width */}
                        <div className="col-span-2 space-y-2">
                            <Label>Cover Image</Label>
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
                                </div>
                            ) : (
                                <div className="border-2 border-dashed rounded-lg p-6">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <Label htmlFor="cover-image" className="cursor-pointer">
                                            <span className="text-sm text-muted-foreground">
                                                Click to upload cover image
                                            </span>
                                            <Input
                                                id="cover-image"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleCoverImageChange}
                                            />
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG or GIF. Max 5MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Title - Full width */}
                        <div className="col-span-2">
                            <Controller
                                control={control}
                                name="title"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="flex">Title <span className="text-destructive ml-1">*</span></FieldLabel>
                                        <Input
                                            id={field.name}
                                            placeholder="Enter blog post title"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                // Auto-generate slug from title if we had a slug field (skipped for now as per schema but good to preserve intent)
                                                // Note: The schema doesn't seem to have a slug field explicitly in the form data shown above?
                                                // Ah, checking lines 30-39: slug is NOT in createBlogSchema.
                                                // Wait, looking at the previous file content from step 145, there WAS a slug field.
                                                // Looking at Step 160 view_file: lines 30-39 DO NOT show a slug field.
                                                // "title: z.string().min(1), content: z.string().min(1), excerpt..., status..., tags..., publishedAt..., seoTitle..., seoDescription..."
                                                // So I should NOT add slug logic if it's not in the schema.
                                            }}
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Excerpt - Full width */}
                        <div className="col-span-2">
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
                        </div>

                        {/* Content - Full width */}
                        <div className="col-span-2">
                            <Controller
                                control={control}
                                name="content"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="flex">Content <span className="text-destructive ml-1">*</span></FieldLabel>
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
                        </div>

                        {/* Status - Column 1 */}
                        <div>
                            <Controller
                                control={control}
                                name="status"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value as PostStatus)}
                                        >
                                            <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={PostStatus.DRAFT}>Draft</SelectItem>
                                                <SelectItem value={PostStatus.PUBLISHED}>Published</SelectItem>
                                                <SelectItem value={PostStatus.ARCHIVED}>Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Tags - Column 2 */}
                        <div>
                            <Controller
                                control={control}
                                name="tags"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                                        <Input
                                            id={field.name}
                                            placeholder="Enter tags separated by commas"
                                            {...field}
                                            value={field.value || ''}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Published At - Column 1 */}
                        <div>
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
                        </div>

                        {/* SEO Title - Column 2 */}
                        <div>
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
                        </div>

                        {/* SEO Description - Full width */}
                        <div className="col-span-2">
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
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={createBlog.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createBlog.isPending || uploading}>
                            {(createBlog.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {(createBlog.isPending || uploading) ? 'Creating...' : 'Create Post'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}



