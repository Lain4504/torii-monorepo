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
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { TiptapEditor } from '@workspace/ui/components/tiptap-editor';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
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
import { Loader2, UploadCloud, X, FileText, Sparkles, Image as ImageIcon } from 'lucide-react';
import { PostStatus, type PostCreateDTO } from '@workspace/schemas';
import { useCreatePost } from '@/api/services/post.ts';
import { toast } from '@workspace/ui/components/sonner';
import { useAppSelector } from '@/hooks/hooks.ts';
import { selectUser } from '@/store/slices/auth-slice.ts';
import { storageApi } from '@/api/services/storage-api.ts';

const createPostSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    excerpt: z.string().optional(),
    status: z.nativeEnum(PostStatus).optional(),
    tags: z.string().optional(), // String input, will be parsed to array
    publishedAt: z.string().optional(), // ISO date string from datetime-local input
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({
    open,
    onOpenChange,
}: CreatePostDialogProps) {
    const user = useAppSelector(selectUser);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<CreatePostFormData>({
        resolver: zodResolver(createPostSchema),
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



    const createPost = useCreatePost();

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

    const handleFormSubmit: SubmitHandler<CreatePostFormData> = async (data) => {
        if (!user?.id) {
            toast.error('User not found');
            return;
        }

        try {
            setUploading(true);
            let coverImageUrl: string | undefined = undefined;

            // Upload cover image if selected
            if (coverImageFile) {
                coverImageUrl = await handleFileUpload(coverImageFile, 'POST');
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

            await createPost.mutateAsync(dto);
            toast.success('Article Initialized', {
                description: 'Post structure established. Content can now be published.',
            });
            handleClose();
        } catch (error: any) {
            toast.error('Initialization Failed', {
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
            <SheetContent className="w-full sm:w-[900px] sm:max-w-[900px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl overflow-hidden">
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative flex items-center gap-4 z-10">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                Initialize <span className="text-primary not-italic">Article</span>
                            </SheetTitle>
                            <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                Step 01: Define Post Specifications
                            </SheetDescription>
                        </div>
                        <div className="p-2 bg-background/50 backdrop-blur-md rounded-full border border-border/20 text-muted-foreground">
                            <Sparkles className="size-4 animate-pulse text-primary" />
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden relative z-10">
                    <ScrollArea className="flex-1 overflow-y-auto px-8 py-8">
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            {/* Basic Information */}
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
                                        <Field>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                Post Title <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="ARTICLE DESIGNATION"
                                                className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="excerpt"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                Excerpt / Short Description
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="BRIEF SUMMARY FOR CARDS..."
                                                rows={3}
                                                className="rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="content"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                Content <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <TiptapEditor
                                                content={field.value || ''}
                                                onChange={(html) => field.onChange(html)}
                                                placeholder="DETAILED ARTICLE CONTENT..."
                                                ariaInvalid={fieldState.invalid}
                                                className="min-h-[400px]"
                                                showCharacterCount={true}
                                                mode="admin"
                                            />
                                            {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="status"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Operational Status
                                                </FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as PostStatus)}
                                                >
                                                    <SelectTrigger id={field.name} className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all">
                                                        <SelectValue placeholder="SELECT STATUS" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                                        <SelectItem value={PostStatus.DRAFT} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">DRAFT</SelectItem>
                                                        <SelectItem value={PostStatus.PUBLISHED} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">PUBLISHED</SelectItem>
                                                        <SelectItem value={PostStatus.ARCHIVED} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">ARCHIVED</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="publishedAt"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Published At
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold transition-all font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    control={control}
                                    name="tags"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                Tags
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="BLOG, NEWS, TUTORIAL (COMMA SEPARATED)"
                                                className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* Media Files */}
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                        Data Assets (Optional)
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="cover-image-upload" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                        Cover Image
                                    </FieldLabel>
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
                                        {coverImageFile && (
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{coverImageFile.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{(coverImageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        )}
                                        {coverImagePreview && (
                                            <div className="relative rounded-2xl overflow-hidden border border-border/20">
                                                <img
                                                    src={coverImagePreview}
                                                    alt="Cover preview"
                                                    className="w-full h-48 object-cover"
                                                />
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
                                        <Field>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                SEO Title
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="SEO TITLE FOR SEARCH ENGINES..."
                                                className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="seoDescription"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                SEO Description
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                value={field.value || ''}
                                                placeholder="SEO DESCRIPTION FOR SEARCH ENGINES..."
                                                rows={3}
                                                className="rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-background/50 backdrop-blur-xl border-t border-border/10 flex items-center justify-between gap-4 relative z-20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={uploading}
                            className="rounded-xl h-12 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/20 group"
                        >
                            <X className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || createPost.isPending}
                            className="rounded-xl h-12 px-8 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                        >
                            {uploading || createPost.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Initializing...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Initialize Post
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}



