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
import { cn } from '@workspace/ui/lib/utils';
import { X, Save, CalendarIcon } from 'lucide-react';
import { blogUpdateDTOSchema, BlogStatus, type BlogUpdateDTO, type BlogResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/lib/api/services/storage-api.ts';
import { useUpdateBlog } from "@/lib/api/services/blog.ts";
import { Spinner } from "@workspace/ui/components/spinner";

const editBlogSchema = blogUpdateDTOSchema.omit({
    tags: true,
    publishedAt: true,
}).extend({
    status: z.nativeEnum(BlogStatus).optional(),
    tags: z.string().optional(), // String input, will be parsed to array
    publishedAt: z.date().optional(), // Date from calendar
});

type EditBlogFormData = z.infer<typeof editBlogSchema>;

interface EditBlogSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog: BlogResponseDTO | null;
}

export function EditBlogSheet({
    open,
    onOpenChange,
    blog,
}: EditBlogSheetProps) {
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<EditBlogFormData>({
        resolver: zodResolver(editBlogSchema),
    });

    const updateBlog = useUpdateBlog();

    // Reset form when blog changes
    useEffect(() => {
        if (blog) {
            reset({
                title: blog.title,
                excerpt: blog.excerpt || '',
                content: blog.content,
                status: blog.status,
                tags: blog.tags ? blog.tags.join(', ') : '',
                publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : undefined,
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

    const handleFormSubmit: SubmitHandler<EditBlogFormData> = async (data) => {
        if (!blog) return;

        try {
            setUploading(true);
            let coverImageUrl: string | undefined = blog.coverImageUrl || undefined;

            if (coverImageFile) {
                coverImageUrl = await handleFileUpload(coverImageFile, 'blog-images');
            } else if (!coverImagePreview && blog.coverImageUrl) {
                coverImageUrl = undefined;
            }

            const tags = data.tags
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

            const publishedAt = data.publishedAt;

            const dto: BlogUpdateDTO = {
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || undefined,
                status: data.status,
                tags,
                coverImageUrl,
                publishedAt,
            };

            await updateBlog.mutateAsync({ id: blog.id, blog: dto });
            toast.success('Đã cập nhật bài viết', {
                description: `Bài viết "${data.title}" đã được cập nhật thành công.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Cập nhật thất bại', {
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!blog) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chỉnh sửa bài viết</SheetTitle>
                    <SheetDescription>
                        Cập nhật thông tin chi tiết và nội dung bài viết.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full overflow-hidden" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">


                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Thông tin chính</FieldLegend>
                                    <FieldDescription>Cập nhật nội dung cơ bản của bài viết.</FieldDescription>

                                    <FieldGroup>
                                        <Controller
                                            control={control}
                                            name="title"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name} className="required">Tiêu đề</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        {...field}
                                                        placeholder="Tiêu đề bài viết"
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
                                                    <FieldLabel htmlFor={field.name}>Mô tả ngắn</FieldLabel>
                                                    <Textarea
                                                        id={field.name}
                                                        {...field}
                                                        value={field.value || ''}
                                                        placeholder="Tóm tắt nội dung..."
                                                        className="min-h-[80px] resize-none"
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
                                                    <FieldLabel htmlFor={field.name} className="required">Nội dung</FieldLabel>
                                                    <div className="rounded-md border border-input overflow-hidden">
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
                                                    <FieldError errors={[fieldState.error]} />
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>
                                </FieldSet>

                                <FieldSeparator />

                                <FieldSet>
                                    <FieldLegend>Phân loại & Xuất bản</FieldLegend>
                                    <FieldDescription>Thiết lập trạng thái hiển thị cho bài viết.</FieldDescription>

                                    <FieldGroup className="grid grid-cols-2 gap-6">
                                        <Controller
                                            control={control}
                                            name="status"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name}>Trạng thái</FieldLabel>
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
                                                    <FieldLabel htmlFor={field.name}>Ngày xuất bản</FieldLabel>
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
                                                                {field.value ? format(field.value, "PPP") : <span>Chọn ngày</span>}
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
                                    </FieldGroup>

                                    <Controller
                                        control={control}
                                        name="tags"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder="Thẻ bài viết (ngăn cách bởi dấu phẩy)"
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
                                    <FieldDescription>Cập nhật ảnh bìa thu hút người đọc.</FieldDescription>

                                    <Field>
                                        <FieldLabel htmlFor="cover-image-upload">Ảnh bìa</FieldLabel>
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
                                                        src={coverImagePreview || (coverImageFile ? URL.createObjectURL(coverImageFile) : '')}
                                                        alt="Bản xem trước"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                </FieldSet>
                            </FieldGroup>
                        </div>
                    </ScrollArea>

                    <SheetFooter>
                        <Button
                            type="submit"
                            disabled={uploading || (!isDirty && !coverImageFile)}>
                            {uploading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang đồng bộ...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}>
                            Hủy bỏ
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
