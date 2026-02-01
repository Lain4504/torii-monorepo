import { useState, useEffect } from 'react';
import { PostPrimaryToolbar } from '@/components/posts/post-primary-toolbar.tsx';
import { PostTable } from '@/components/posts/post-table.tsx';
import { CreatePostSheet } from '@/components/posts/create-post-sheet.tsx';
import { EditPostSheet } from '@/components/posts/edit-post-sheet.tsx';
import { DeletePostDialog } from '@/components/posts/delete-post-dialog.tsx';
import { ViewPostSheet } from '@/components/posts/view-post-sheet.tsx';
import type { PostResponseDTO, PostQueryDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

import { usePosts } from "@/api/services/post.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Plus, ShieldAlert } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';

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

    const posts = data?.data || [];
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

                {/* Table container */}
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <PostTable
                        data={posts}
                        onEdit={setEditingPost}
                        onDelete={setDeletingPost}
                        onView={setViewingPost}
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
            <CreatePostSheet
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <EditPostSheet
                open={!!editingPost}
                onOpenChange={(open) => !open && setEditingPost(null)}
                post={editingPost}
            />

            <DeletePostDialog
                open={!!deletingPost}
                onOpenChange={(open) => !open && setDeletingPost(null)}
                post={deletingPost}
            />

            <ViewPostSheet
                open={!!viewingPost}
                onOpenChange={(open) => !open && setViewingPost(null)}
                post={viewingPost}
            />
        </div>
    );
}
