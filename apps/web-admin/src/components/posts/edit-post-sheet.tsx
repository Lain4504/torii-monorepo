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
import { Loader2, UploadCloud, X, FileText, Save, Calendar, Eye, MessageCircle } from 'lucide-react';
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
                seoTitle: data.seoTitle || undefined,
                seoDescription: data.seoDescription || undefined,
                publishedAt,
            };

            await updatePost.mutateAsync(dto);
            toast.success('Post Re-calibrated', {
                description: `Parameters for ${data.title} successfully updated.`,
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
            <SheetContent className="w-full sm:w-[900px] sm:max-w-[900px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl overflow-hidden">
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                    Modify <span className="text-primary not-italic">Repository</span>
                                </SheetTitle>
                                <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                    ID: <span className="font-mono text-primary">{post.id.substring(0, 8)}</span>
                                </SheetDescription>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "px-3 py-1.5 uppercase tracking-widest text-[10px] font-black border-2",
                                post.status === 'published'
                                    ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10"
                                    : post.status === 'draft'
                                        ? "border-blue-500/20 text-blue-500 bg-blue-500/10"
                                        : "border-muted-foreground/20 text-muted-foreground bg-muted/10"
                            )}>
                            {post.status}
                        </Badge>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden relative z-10">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 py-10 space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">

                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all group">
                                    <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                        <div className="p-2 rounded-xl bg-background/50 text-primary border border-border/10">
                                            <Eye className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Views</span>
                                    </div>
                                    <div className="text-4xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                                        {post.viewCount || 0}
                                    </div>
                                </div>
                                <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all group">
                                    <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                        <div className="p-2 rounded-xl bg-background/50 text-blue-500 border border-border/10">
                                            <MessageCircle className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Comments</span>
                                    </div>
                                    <div className="text-4xl font-black text-foreground tracking-tight group-hover:text-blue-500 transition-colors">
                                        {post.commentCount || 0}
                                    </div>
                                </div>
                                <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all group">
                                    <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                        <div className="p-2 rounded-xl bg-background/50 text-purple-500 border border-border/10">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Last Updated</span>
                                    </div>
                                    <div className="text-xl font-bold text-foreground font-mono tracking-tight group-hover:text-purple-500 transition-colors pt-2">
                                        {new Date(post.updatedAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/20" />

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                        Core Specifications
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Title</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="ARTICLE DESIGNATION"
                                                className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="excerpt"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Excerpt</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="BRIEF SUMMARY FOR CARDS..."
                                                className="min-h-[80px] rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="content"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Content</FieldLabel>
                                            <div className="rounded-2xl border border-border/20 bg-background overflow-hidden">
                                                <TiptapEditor
                                                    content={field.value || ''}
                                                    onChange={(html) => field.onChange(html)}
                                                    placeholder="WRITE YOUR ARTICLE CONTENT HERE..."
                                                    ariaInvalid={fieldState.invalid}
                                                    className="min-h-[400px]"
                                                    showCharacterCount={true}
                                                    mode="admin"
                                                />
                                            </div>
                                            <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="status"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Status</FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as PostStatus)}
                                                >
                                                    <SelectTrigger id={field.name} className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="SELECT STATUS" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                                        <SelectItem value={PostStatus.DRAFT} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">Draft</SelectItem>
                                                        <SelectItem value={PostStatus.PUBLISHED} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">Published</SelectItem>
                                                        <SelectItem value={PostStatus.ARCHIVED} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="publishedAt"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Published At</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold transition-all font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    control={control}
                                    name="tags"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Tags</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="JLPT, GRAMMAR, BEGINNER (COMMA SEPARATED)"
                                                className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                        </Field>
                                    )}
                                />

                                {/* Media Upload */}
                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                            Data Assets (Optional)
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="cover-image-upload" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Cover Image</FieldLabel>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="cover-image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleCoverImageChange}
                                                        className="h-14 px-4 pt-3.5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-xs font-bold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                                                    />
                                                    <UploadCloud className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                </div>
                                                {coverImageFile && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={removeCoverImage}
                                                        className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {(coverImagePreview || coverImageFile) && (
                                                <div className="rounded-2xl overflow-hidden border border-border/40 bg-muted/30 aspect-video relative shadow-sm max-w-xs group">
                                                    <img
                                                        src={coverImagePreview || URL.createObjectURL(coverImageFile!)}
                                                        alt="Cover preview"
                                                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                </div>

                                {/* SEO Metadata */}
                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                            SEO Metadata
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Controller
                                        control={control}
                                        name="seoTitle"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">SEO Title</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder="OPTIONAL SEO TITLE..."
                                                    className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="seoDescription"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">SEO Description</FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder="OPTIONAL SEO DESCRIPTION..."
                                                    rows={3}
                                                    className="rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="px-8 py-6 bg-background/50 backdrop-blur-xl border-t border-border/10 flex flex-row items-center justify-between gap-4 relative z-20 flex-shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl h-12 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/20 group"
                        >
                            <X className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || (!isDirty && !coverImageFile)}
                            className="rounded-xl h-12 px-8 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
