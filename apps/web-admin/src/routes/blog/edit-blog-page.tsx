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
import { RichTextEditor, type EditorJsData } from '@/components/editor/rich-text-editor';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

const editBlogSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    excerpt: z.string().optional(),
    status: z.nativeEnum(BlogStatus),
});

type EditBlogFormData = z.infer<typeof editBlogSchema>;

export default function EditBlogPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: blog, isLoading, error } = useBlog(id!);
    const updateBlog = useUpdateBlog();

    const [content, setContent] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<EditBlogFormData>({
        resolver: zodResolver(editBlogSchema),
        defaultValues: {
            title: '',
            excerpt: '',
            status: BlogStatus.DRAFT,
        },
    });

    useEffect(() => {
        if (blog) {
            setContent(blog.content || '');
            reset({
                title: blog.title,
                excerpt: blog.excerpt || '',
                status: blog.status,
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

    const renderPreview = () => {
        if (!content) {
            return (
                <div className="p-8 text-center text-muted-foreground">
                    Chưa có nội dung để xem trước
                </div>
            );
        }

        try {
            const parsedContent = JSON.parse(content) as EditorJsData;
            return (
                <div className="prose prose-slate max-w-none p-8">
                    {parsedContent.blocks?.map((block: any, index: number) => {
                        switch (block.type) {
                            case 'header': {
                                const level = block.data.level as 1 | 2 | 3 | 4 | 5 | 6;
                                const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                                return <Tag key={index}>{block.data.text}</Tag>;
                            }
                            case 'paragraph':
                                return <p key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                            case 'list':
                                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                                return (
                                    <ListTag key={index}>
                                        {block.data.items?.map((item: string, i: number) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                                        ))}
                                    </ListTag>
                                );
                            case 'quote':
                                return (
                                    <blockquote key={index}>
                                        <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                                        {block.data.caption && <cite>{block.data.caption}</cite>}
                                    </blockquote>
                                );
                            case 'code':
                                return <pre key={index}><code>{block.data.code}</code></pre>;
                            case 'image':
                                return (
                                    <figure key={index}>
                                        <img src={block.data.file?.url} alt={block.data.caption || ''} />
                                        {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                                    </figure>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            );
        } catch (error) {
            return (
                <div className="p-8 text-center text-destructive">
                    Lỗi hiển thị nội dung xem trước
                </div>
            );
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
                <Card>
                    <CardContent className="p-6">
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
                                                        <SelectItem value={BlogStatus.PUBLISHED}>Đã đăng</SelectItem>
                                                        <SelectItem value={BlogStatus.ARCHIVED}>Đã lưu trữ</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                            </FieldSet>
                        </FieldGroup>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden bg-background">
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
                                    initialContent={blog.content}
                                    onUpdate={(data: EditorJsData) => setContent(JSON.stringify(data))}
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
