import { useState } from 'react';
import { BlogPrimaryToolbar } from '@/features/blog/components/blog-primary-toolbar';
import { BlogTable } from '@/features/blog/components/blog-table';
import { CreateBlogDialog } from '@/features/blog/components/create-blog-dialog';
import { EditBlogDialog } from '@/features/blog/components/edit-blog-dialog';
import { DeleteBlogDialog } from '@/features/blog/components/delete-blog-dialog';
import { ViewBlogDialog } from '@/features/blog/components/view-blog-dialog';
import { useBlogs } from '@/features/blog/api/blog';
import type { BlogPostResponseDTO, BlogPostQueryDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

export function BlogPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState('publishedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingBlog, setEditingBlog] = useState<BlogPostResponseDTO | null>(null);
    const [deletingBlog, setDeletingBlog] = useState<BlogPostResponseDTO | null>(null);
    const [viewingBlog, setViewingBlog] = useState<BlogPostResponseDTO | null>(null);

    // Query params
    const queryParams: BlogPostQueryDTO = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter as any }),
        sortBy,
        sortOrder,
    };

    const { data, isLoading, error } = useBlogs(queryParams);

    if (isLoading) {
        return <div className="p-6 text-center py-8">Loading blog posts...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-destructive py-8">Error: {error.message}</div>;
    }

    const blogs = data?.data || [];
    const meta = data ? {
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit,
    } : null;

    return (
        <div className="p-6 space-y-6 max-w-full">
            <BlogPrimaryToolbar
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onSortChange={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                }}
                onAddNew={() => setShowCreateDialog(true)}
            />

            <BlogTable
                data={blogs}
                onEdit={setEditingBlog}
                onDelete={setDeletingBlog}
                onView={setViewingBlog}
                page={page}
                limit={queryParams.limit || 10}
            />

            {/* Pagination */}
            {meta && (
                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        Showing {blogs.length} of {meta.total} posts
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2 text-sm">
                            Page {page} of {meta.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={page >= meta.totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <CreateBlogDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <EditBlogDialog
                open={!!editingBlog}
                onOpenChange={(open) => !open && setEditingBlog(null)}
                blog={editingBlog}
            />

            <DeleteBlogDialog
                open={!!deletingBlog}
                onOpenChange={(open) => !open && setDeletingBlog(null)}
                blog={deletingBlog}
            />

            <ViewBlogDialog
                open={!!viewingBlog}
                onOpenChange={(open) => !open && setViewingBlog(null)}
                blog={viewingBlog}
            />
        </div>
    );
}

