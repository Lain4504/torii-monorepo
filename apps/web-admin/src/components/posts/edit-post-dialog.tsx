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
import { TiptapEditor } from '@workspace/ui/components/tiptap-editor';
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
import { postUpdateDTOSchema, PostStatus, type PostUpdateDTO, type PostResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/api/services/storage-api.ts';
import { useUpdatePost } from "@/api/services/post.ts";

const editPostSchema = postUpdateDTOSchema.omit({
    tags: true,
    publishedAt: true,
}).extend({
    status: z.nativeEnum(PostStatus).optional(),
    tags: z.string().optional(), // String input, will be parsed to array
    publishedAt: z.string().optional(), // ISO date string from datetime-local input
});

type EditPostFormData = z.infer<typeof editPostSchema>;

interface EditPostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: PostResponseDTO | null;
}

export function EditPostDialog({
    open,
    onOpenChange,
    post,
}: EditPostDialogProps) {
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
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
                seoTitle: post.seoTitle || '',
                seoDescription: post.seoDescription || '',
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

    const handleFormSubmit: SubmitHandler<EditPostFormData> = async (data) => {
        if (!post) return;

        try {
            setUploading(true);
            let coverImageUrl: string | undefined = post.coverImageUrl || undefined;

            // Upload new cover image if selected
            if (coverImageFile) {
                coverImageUrl = await handleFileUpload(coverImageFile, 'POST');
            } else if (!coverImagePreview && post.coverImageUrl) {
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

            const dto: PostUpdateDTO = {
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

            await updatePost.mutateAsync(dto);
            toast.success('Post updated successfully!');
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to update post', {
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!post) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
                <DialogHeader className="p-8 pb-4 bg-muted/30">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Edit Post</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 pt-4 space-y-6" noValidate>
                    {/* Cover Image */}
                    <Field className="space-y-2">
                        <FieldLabel htmlFor="cover-image-edit" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Cover Image</FieldLabel>
                        {coverImagePreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-border">
                                <img
                                    src={coverImagePreview}
                                    alt="Cover preview"
                                    className="w-full h-48 object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
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
                                                className="h-8"
                                            >
                                                Change Image
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
                            <div className="border-2 border-dashed border-border/50 rounded-xl p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <FieldLabel htmlFor="cover-image-edit" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Click to upload cover image
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                            control={control}
                            name="title"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2 col-span-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Title</FieldLabel>
                                    <Input
                                        id={field.name}
                                        {...field}
                                        placeholder="Enter post title"
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="excerpt"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2 col-span-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Excerpt</FieldLabel>
                                    <Textarea
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Short description of the post"
                                        rows={3}
                                        className="border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="content"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2 col-span-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Content</FieldLabel>
                                    <TiptapEditor
                                        content={field.value || ''}
                                        onChange={(html) => field.onChange(html)}
                                        placeholder="Write your post content here..."
                                        ariaInvalid={fieldState.invalid}
                                        className="min-h-[400px]"
                                        showCharacterCount={true}
                                        mode="admin"
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Status</FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => field.onChange(value as PostStatus)}
                                    >
                                        <SelectTrigger id={field.name} className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all" aria-invalid={fieldState.invalid}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-none shadow-2xl bg-popover/95 backdrop-blur-xl rounded-xl">
                                            <SelectItem value={PostStatus.DRAFT} className="rounded-lg focus:bg-primary/5">Draft</SelectItem>
                                            <SelectItem value={PostStatus.PUBLISHED} className="rounded-lg focus:bg-primary/5">Published</SelectItem>
                                            <SelectItem value={PostStatus.ARCHIVED} className="rounded-lg focus:bg-primary/5">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="tags"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Tags</FieldLabel>
                                    <Input
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Enter tags separated by commas"
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="publishedAt"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Published At</FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="datetime-local"
                                        {...field}
                                        value={field.value || ''}
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="seoTitle"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">SEO Title</FieldLabel>
                                    <Input
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Enter SEO title (optional)"
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="seoDescription"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2 col-span-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">SEO Description</FieldLabel>
                                    <Textarea
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Enter SEO description (optional)"
                                        rows={3}
                                        className="border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={updatePost.isPending || uploading}
                            className="rounded-xl h-11 px-6 hover:bg-primary/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updatePost.isPending || uploading}
                            className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            {(updatePost.isPending || uploading) ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : 'Update Post'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}



