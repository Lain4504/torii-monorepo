import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBlog, useUpdateBlog } from '@/lib/api/services/blog';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Card, CardContent } from '@workspace/ui/components/card';
import { BlogStatus } from '@workspace/schemas';
import { Spinner } from '@workspace/ui/components/spinner';
import { toast } from '@workspace/ui/components/sonner';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { ArrowLeft, Save } from 'lucide-react';
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

const editBlogSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    excerpt: z.string().optional(),
    status: z.nativeEnum(BlogStatus),
    publishedAt: z.string().optional(),
});

type EditBlogFormData = z.infer<typeof editBlogSchema>;

export default function EditBlogPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: blog, isLoading, error } = useBlog(id!);
    const updateBlog = useUpdateBlog();

    const [content, setContent] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
    } = useForm<EditBlogFormData>({
        resolver: zodResolver(editBlogSchema),
        defaultValues: {
            title: '',
            excerpt: '',
            status: BlogStatus.DRAFT,
            publishedAt: '',
        },
    });

    const statusValue = watch("status");

    useEffect(() => {
        if (blog) {
            setContent(blog.content || '');
            reset({
                title: blog.title,
                excerpt: blog.excerpt || '',
                status: blog.status,
                publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : '',
            });
        }
    }, [blog, reset]);

    const handleFormSubmit: SubmitHandler<EditBlogFormData> = async (data) => {
        if (!blog) return;

        setIsSaving(true);
        try {
            await updateBlog.mutateAsync({
                id: blog.id,
                blog: {
                    title: data.title,
                    excerpt: data.excerpt || undefined,
                    content,
                    status: data.status,
                    publishedAt: data.status === BlogStatus.SCHEDULED && data.publishedAt ? new Date(data.publishedAt) : undefined,
                }
            });
            toast.success('Đã lưu bài viết');
            navigate('/blogs');
        } catch (error: any) {
            toast.error('Lưu bài viết thất bại', {
                description: error.response?.data?.message || error.message
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="p-8 text-center text-destructive">
                Không thể tải bài viết
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/blogs')}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <span>Chỉnh sửa bài viết</span>
                    </div>
                }
                subtitle="Sử dụng trình soạn thảo để thiết kế nội dung bài viết."
                actions={
                    <Button
                        disabled={isSaving}
                        onClick={handleSubmit(handleFormSubmit)}
                    >
                        {isSaving ? <Spinner className="mr-2" /> : <Save className="mr-2 size-4" />}
                        Lưu bài viết
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
                                </FieldGroup>
                            </FieldSet>
                        </FieldGroup>
                    </div>

                    <CardContent className="p-0 border-y">
                        <div className="p-6 h-full min-h-[500px]">
                            <RichTextEditor
                                initialContent={blog.content}
                                onUpdate={(data: string) => setContent(data)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
