import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPrimaryToolbar } from '@/components/blogs/blog-primary-toolbar.tsx';
import { BlogTable } from '@/components/blogs/blog-table.tsx';
import { DeleteBlogDialog } from '@/components/blogs/delete-blog-dialog.tsx';
import { ScheduleBlogDialog } from '@/components/blogs/schedule-blog-dialog.tsx';
import type { BlogResponseDTO, BlogQueryDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

import { useBlogs } from "@/lib/api/services/blog.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Plus, TriangleAlert } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { Card, CardContent } from "@workspace/ui/components/card";
import { formatNumber } from "@/lib/format-utils";

export function BlogPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState('publishedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States
    const [deletingBlog, setDeletingBlog] = useState<BlogResponseDTO | null>(null);
    const [schedulingBlog, setSchedulingBlog] = useState<BlogResponseDTO | null>(null);

    const navigate = useNavigate();

    // Query params
    const queryParams: BlogQueryDTO = {
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter as any }),
        sortBy,
        sortOrder,
        showScheduled: true,
    };

    const { data, isLoading, error } = useBlogs(queryParams);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter]);

    if (error) {
        return (
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <Empty>
                        <EmptyMedia className="bg-destructive/10 text-destructive">
                            <TriangleAlert className="size-6" />
                        </EmptyMedia>
                        <EmptyContent>
                            <EmptyTitle>Có lỗi xảy ra</EmptyTitle>
                            <EmptyDescription>{error.message}</EmptyDescription>
                        </EmptyContent>
                        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>
                    </Empty>
                </CardContent>
            </Card>
        );
    }

    const blogs = data?.data || [];
    const meta = data ? {
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit,
    } : null;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Bài viết & Tin tức"
                subtitle="Quản lý nội dung học thuật và cộng đồng Torii"
                stats={[
                    { label: "Tổng số bài viết", value: formatNumber(meta?.total) || 0 }
                ]}
                actions={
                    <Button
                        onClick={() => navigate('/blogs/create')}
                        size="lg"
                    >
                        <Plus />
                        Tạo bài viết mới
                    </Button>
                }
            />


            <div className="space-y-4">
                <BlogPrimaryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    onSortChange={(field, order) => {
                        setSortBy(field);
                        setSortOrder(order);
                    }}
                />

                <Card className="overflow-hidden">
                    <CardContent className="p-0">

                        <BlogTable
                            data={blogs}
                            onEdit={(b) => navigate(`/blogs/${b.id}/edit`)}
                            onDelete={setDeletingBlog}
                            onScheduleChange={setSchedulingBlog}
                            page={page}
                            limit={queryParams.limit || 10}
                            isLoading={isLoading}
                        />

                    </CardContent>
                </Card>

                <SmartPagination
                    page={page}
                    totalPages={meta?.totalPages || 0}
                    totalItems={meta?.total || 0}
                    onPageChange={setPage}
                    itemName="bài viết"
                />
            </div>

            {/* Dialogs */}
            <DeleteBlogDialog
                open={!!deletingBlog}
                onOpenChange={(open) => !open && setDeletingBlog(null)}
                blog={deletingBlog}
            />

            <ScheduleBlogDialog
                open={!!schedulingBlog}
                onOpenChange={(open) => !open && setSchedulingBlog(null)}
                blogId={schedulingBlog?.id || ''}
            />
        </div>
    );
}
