import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Card, CardContent } from '@workspace/ui/components/card';
import { BlogStatus, type BlogCreateDTO } from '@workspace/schemas';
import { useCreateBlog } from '@/lib/api/services/blog.ts';
import { toast } from '@workspace/ui/components/sonner';
import { useAppSelector } from '@/hooks/hooks.ts';
import { selectUser } from '@/store/slices/auth-slice.ts';
import { storageApi } from '@/lib/api/services/storage-api.ts';
import { Spinner } from "@workspace/ui/components/spinner";
import { PageHeader } from '@/components/common/page-header';
import { ArrowLeft, Save } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { X } from 'lucide-react';

const createBlogSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    excerpt: z.string().optional(),
    status: z.nativeEnum(BlogStatus),
    publishedAt: z.string().optional(),
});

type CreateBlogFormData = z.infer<typeof createBlogSchema>;

export default function CreateBlogPage() {
    const user = useAppSelector(selectUser);
    const navigate = useNavigate();
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [content, setContent] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
    } = useForm<CreateBlogFormData>({
        resolver: zodResolver(createBlogSchema),
        defaultValues: {
            title: '',
            excerpt: '',
            status: BlogStatus.DRAFT,
            publishedAt: '',
        },
    });

    const statusValue = watch("status");

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
                content: content || '<p></p>',
                excerpt: data.excerpt || undefined,
                status: data.status,
                publishedAt: data.status === BlogStatus.SCHEDULED && data.publishedAt ? new Date(data.publishedAt) : undefined,
                authorId: user.id,
                coverImageUrl,
            };

            const createdBlog = await createBlog.mutateAsync(dto);
            console.log('Blog created:', createdBlog.id);
            toast.success('Đã tạo bài viết', {
                description: 'Bài viết đã được tạo thành công',
            });
            navigate('/blogs');
        } catch (error: any) {
            toast.error('Tạo bài viết thất bại', {
                description: error.response?.data?.message || error.userMessage || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/blogs')}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <span>Tạo bài viết mới</span>
                    </div>
                }
                subtitle="Điền thông tin và nội dung cho bài viết mới."
                actions={
                    <Button
                        disabled={uploading}
                        onClick={handleSubmit(handleFormSubmit)}
                    >
                        {uploading ? <Spinner className="mr-2" /> : <Save className="mr-2 size-4" />}
                        Tạo bài viết
                    </Button>
                }
            />

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <Card className="overflow-hidden bg-background">
                    <div className="p-6 border-b">
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

                                    <Controller
                                        control={control}
                                        name="status"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Trạng thái đăng bài
                                                </FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn trạng thái" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={BlogStatus.DRAFT}>Bản nháp</SelectItem>
                                                        <SelectItem value={BlogStatus.PUBLISHED}>Đã đăng (Xuất bản)</SelectItem>
                                                        <SelectItem value={BlogStatus.SCHEDULED}>Lên lịch</SelectItem>
                                                        <SelectItem value={BlogStatus.ARCHIVED}>Đã lưu trữ</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />

                                    {statusValue === BlogStatus.SCHEDULED && (
                                        <Controller
                                            control={control}
                                            name="publishedAt"
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name} className="required">
                                                        Thời gian đăng bài
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        type="datetime-local"
                                                        {...field}
                                                    />
                                                    <FieldError errors={[fieldState.error]} />
                                                </Field>
                                            )}
                                        />
                                    )}

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
                    </div>

                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
                            <div className="border-b px-6 pt-6">
                                <TabsList>
                                    <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
                                    <TabsTrigger value="preview">Xem trước</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="edit" className="m-0 p-6">
                                <RichTextEditor
                                    initialContent={content}
                                    onUpdate={(data: string) => setContent(data)}
                                />
                            </TabsContent>
                            <TabsContent value="preview" className="m-0">
                                {renderPreview()}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
