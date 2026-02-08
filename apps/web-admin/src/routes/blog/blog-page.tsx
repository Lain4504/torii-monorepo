import { useState, useEffect } from 'react';
import { BlogPrimaryToolbar } from '@/components/blogs/blog-primary-toolbar.tsx';
import { BlogTable } from '@/components/blogs/blog-table.tsx';
import { CreateBlogSheet } from '@/components/blogs/create-blog-sheet.tsx';
import { EditBlogSheet } from '@/components/blogs/edit-blog-sheet.tsx';
import { DeleteBlogDialog } from '@/components/blogs/delete-blog-dialog.tsx';
import { ViewBlogSheet } from '@/components/blogs/view-blog-sheet.tsx';
import type { BlogResponseDTO, BlogQueryDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

import { useBlogs } from "@/api/services/blog.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Plus, ShieldAlert } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';

export function BlogPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState('publishedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingBlog, setEditingBlog] = useState<BlogResponseDTO | null>(null);
    const [deletingBlog, setDeletingBlog] = useState<BlogResponseDTO | null>(null);
    const [viewingBlog, setViewingBlog] = useState<BlogResponseDTO | null>(null);

    // Query params
    const queryParams: BlogQueryDTO = {
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter as any }),
        sortBy,
        sortOrder,
    };

    const { data, isLoading, error } = useBlogs(queryParams);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-destructive/5 rounded-[2rem] border border-dashed border-destructive/20 text-center animate-in fade-in duration-500">
                <div className="size-16 rounded-xl bg-white/50 shadow-sm flex items-center justify-center">
                    <ShieldAlert className="size-8 text-destructive/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-medium text-foreground">Thông báo Hệ thống</h3>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </div>
            </div>
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
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500">
            <PageHeader
                title="Bài viết & Tin tức"
                subtitle="Quản lý nội dung học thuật và cộng đồng Torii"
                stats={[
                    { label: "Tổng số bài viết", value: meta?.total.toLocaleString() || 0 }
                ]}
                actions={
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
                    >
                        <Plus className="mr-2 size-4" />
                        Tạo bài viết mới
                    </Button>
                }
            />


            <div className="space-y-4">
                {/* Toolbar area */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
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
                </div>

                {/* Table container */}
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <BlogTable
                        data={blogs}
                        onEdit={setEditingBlog}
                        onDelete={setDeletingBlog}
                        onView={setViewingBlog}
                        page={page}
                        limit={queryParams.limit || 10}
                        isLoading={isLoading}
                    />
                </div>

                {/* Pagination */}
                <SmartPagination
                    page={page}
                    totalPages={meta?.totalPages || 0}
                    totalItems={meta?.total || 0}
                    onPageChange={setPage}
                    itemName="bài viết"
                />
            </div>

            {/* Dialogs */}
            <CreateBlogSheet
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <EditBlogSheet
                open={!!editingBlog}
                onOpenChange={(open) => !open && setEditingBlog(null)}
                blog={editingBlog}
            />

            <DeleteBlogDialog
                open={!!deletingBlog}
                onOpenChange={(open) => !open && setDeletingBlog(null)}
                blog={deletingBlog}
            />

            <ViewBlogSheet
                open={!!viewingBlog}
                onOpenChange={(open) => !open && setViewingBlog(null)}
                blog={viewingBlog}
            />
        </div>
    );
}
