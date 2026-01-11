import { useState, useEffect } from 'react';
import { PostPrimaryToolbar } from '@/components/posts/post-primary-toolbar.tsx';
import { PostTable } from '@/components/posts/post-table.tsx';
import { CreatePostDialog } from '@/components/posts/create-post-dialog.tsx';
import { EditPostDialog } from '@/components/posts/edit-post-dialog.tsx';
import { DeletePostDialog } from '@/components/posts/delete-post-dialog.tsx';
import { ViewPostDialog } from '@/components/posts/view-post-dialog.tsx';
import type { PostResponseDTO, PostQueryDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { usePosts } from "@/api/services/post.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination";

export function PostPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState('publishedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingPost, setEditingPost] = useState<PostResponseDTO | null>(null);
    const [deletingPost, setDeletingPost] = useState<PostResponseDTO | null>(null);
    const [viewingPost, setViewingPost] = useState<PostResponseDTO | null>(null);

    // Query params
    const queryParams: PostQueryDTO = {
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter as any }),
        sortBy,
        sortOrder,
    };

    const { data, isLoading, error } = usePosts(queryParams);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter]);

    if (error) {
        return <div className="p-6 text-center text-destructive py-8">Error: {error.message}</div>;
    }

    const posts = data?.data || [];
    const meta = data ? {
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit,
    } : null;

    const renderPaginationItems = () => {
        if (!meta) return null;
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(meta.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={() => setPage(i)}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < meta.totalPages) {
            if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" />);
            items.push(
                <PaginationItem key={meta.totalPages}>
                    <PaginationLink onClick={() => setPage(meta.totalPages)}>{meta.totalPages}</PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Posts</h1>
                    <p className="text-muted-foreground">Manage articles, news, and community updates.</p>
                </div>
                <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="rounded-full shadow-lg shadow-primary/20 bg-primary"
                >
                    Create New Post
                </Button>
            </div>

            <div className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl rounded-2xl p-0 overflow-hidden">
                <div className="p-6 pb-0">
                    <PostPrimaryToolbar
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

                <div className="mt-6">
                    <PostTable
                        data={posts}
                        onEdit={setEditingPost}
                        onDelete={setDeletingPost}
                        onView={setViewingPost}
                        page={page}
                        limit={queryParams.limit || 10}
                        isLoading={isLoading}
                    />

                    {/* Pagination */}
                    {meta && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border/40 px-6">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{posts.length}</span> of <span className="font-semibold text-foreground">{meta.total}</span> posts
                            </div>

                            {meta.totalPages > 1 && (
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {renderPaginationItems()}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                                className={page === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <CreatePostDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <EditPostDialog
                open={!!editingPost}
                onOpenChange={(open) => !open && setEditingPost(null)}
                post={editingPost}
            />

            <DeletePostDialog
                open={!!deletingPost}
                onOpenChange={(open) => !open && setDeletingPost(null)}
                post={deletingPost}
            />

            <ViewPostDialog
                open={!!viewingPost}
                onOpenChange={(open) => !open && setViewingPost(null)}
                post={viewingPost}
            />
        </div>
    );
}
