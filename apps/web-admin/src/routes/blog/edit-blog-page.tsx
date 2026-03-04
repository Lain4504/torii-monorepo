import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog, useUpdateBlog } from '@/lib/api/services/blog';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { BlogStatus } from '@workspace/schemas';
import { Spinner } from '@workspace/ui/components/spinner';
import { toast } from '@workspace/ui/components/sonner';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { ArrowLeft, Save, Send, ChevronDown, CalendarClock } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { ButtonGroup } from '@workspace/ui/components/button-group';
import { ScheduleBlogDialog } from '@/components/blogs/schedule-blog-dialog';

export default function EditBlogPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: blog, isLoading, error } = useBlog(id!);
    const updateBlog = useUpdateBlog();

    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    useEffect(() => {
        if (blog) {
            setContent(blog.content || '');
        }
    }, [blog]);

    const handleSave = async (status?: BlogStatus) => {
        if (!blog) return;

        setIsSaving(true);
        try {
            await updateBlog.mutateAsync({
                id: blog.id,
                blog: {
                    content,
                    status: status || blog.status,
                }
            });
            toast.success(status === BlogStatus.PUBLISHED ? 'Đã xuất bản bài viết' : 'Đã lưu bản nháp');
            if (status === BlogStatus.PUBLISHED) {
                navigate('/blogs');
            }
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
                        <span>Chỉnh sửa: {blog.title}</span>
                    </div>
                }
                subtitle="Sử dụng trình soạn thảo để thiết kế nội dung bài viết."
                actions={
                    <ButtonGroup>
                        <Button
                            disabled={isSaving}
                            onClick={() => handleSave(BlogStatus.DRAFT)}
                        >
                            {isSaving ? <Spinner className="mr-2" /> : <Save className="mr-2 size-4" />}
                            Lưu nháp
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    disabled={isSaving}
                                    size="icon"
                                >
                                    <ChevronDown className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSave(BlogStatus.PUBLISHED)}>
                                    <Send className="mr-2 size-4" />
                                    Xuất bản
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsScheduleOpen(true)}>
                                    <CalendarClock className="mr-2 size-4" />
                                    Lên lịch
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ButtonGroup>
                }
            />

            <Card className="overflow-hidden bg-background">
                <CardContent className="p-0">
                    <RichTextEditor
                        initialContent={blog.content}
                        onUpdate={(html) => setContent(html)}
                    />
                </CardContent>
            </Card>

            <ScheduleBlogDialog
                open={isScheduleOpen}
                onOpenChange={setIsScheduleOpen}
                blogId={blog.id}
                content={content}
                onSuccess={() => navigate('/blogs')}
            />
        </div>
    );
}
