import { useState } from 'react';
import { BlogPrimaryToolbar } from '@/components/blogs/blog-primary-toolbar.tsx';
import { BlogTable } from '@/components/blogs/blog-table.tsx';
import { CreateBlogDialog } from '@/components/blogs/create-blog-dialog.tsx';
import { EditBlogDialog } from '@/components/blogs/edit-blog-dialog.tsx';
import { DeleteBlogDialog } from '@/components/blogs/delete-blog-dialog.tsx';
import { ViewBlogDialog } from '@/components/blogs/view-blog-dialog.tsx';
import type { BlogPostResponseDTO, BlogPostQueryDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { useBlogs } from "@/api/services/blog.ts";

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
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
                    <p className="text-muted-foreground">Manage articles, news, and community updates.</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    Create New Post
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
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

                    <div className="mt-6 rounded-md border">
                        <BlogTable
                            data={blogs}
                            onEdit={setEditingBlog}
                            onDelete={setDeletingBlog}
                            onView={setViewingBlog}
                            page={page}
                            limit={queryParams.limit || 10}
                        />
                    </div>

                    {/* Pagination */}
                    {meta && (
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="flex-1 text-sm text-muted-foreground">
                                Showing {blogs.length} of {meta.total} posts
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </Button>
                                <div className="text-sm font-medium">
                                    Page {page} of {meta.totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= meta.totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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

