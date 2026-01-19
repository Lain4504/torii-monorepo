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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { cn } from '@workspace/ui/lib/utils';
import { Plus, ShieldAlert } from 'lucide-react';

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
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(1);
                        }}
                        className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-50" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(i);
                        }}
                        className={cn(
                            "rounded-md border h-9 w-9 text-xs font-semibold transition-all",
                            page === i
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < meta.totalPages) {
            if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-50" />);
            items.push(
                <PaginationItem key={meta.totalPages}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(meta.totalPages);
                        }}
                        className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        {meta.totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-4 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Bài viết & <span className="text-primary not-italic">Tin tức</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Quản lý nội dung học thuật và cộng đồng Torii
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="h-10 px-4 rounded-xl font-medium shadow-sm"
                    >
                        <Plus className="mr-2 size-4" />
                        Tạo bài viết mới
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Toolbar area */}
                <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
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
                <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
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
                {meta && (meta.total > 0 || isLoading) && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span>Hiển thị trang <span className="text-foreground">{page}</span> / {meta.totalPages}</span>
                            <span className="mx-1 text-border">|</span>
                            <span>Tổng cộng <span className="text-foreground">{meta.total}</span> bài viết</span>
                        </div>

                        {meta.totalPages > 1 && (
                            <Pagination className="w-auto mx-0">
                                <PaginationContent className="flex items-center gap-1">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.max(1, p - 1));
                                            }}
                                            className={cn(
                                                "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="hidden md:flex items-center gap-1">
                                        {renderPaginationItems()}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.min(meta.totalPages, p + 1));
                                            }}
                                            className={cn(
                                                "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                                page === meta.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
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
