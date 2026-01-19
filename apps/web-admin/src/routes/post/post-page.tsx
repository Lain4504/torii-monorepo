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
import { FileText, Plus, Sparkles, ShieldAlert } from 'lucide-react';

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
                    <h3 className="text-lg font-medium text-foreground">System Notice</h3>
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
                        className="rounded-xl h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-20" />);
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
                            "rounded-xl h-10 w-10 text-xs font-medium transition-all",
                            page === i ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                        )}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < meta.totalPages) {
            if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-20" />);
            items.push(
                <PaginationItem key={meta.totalPages}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(meta.totalPages);
                        }}
                        className="rounded-xl h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all"
                    >
                        {meta.totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-8 relative px-0 md:px-2">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <FileText className="size-3.5" />
                        Content Library
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                        Content <span className="text-primary">& News</span>
                    </h1>
                    <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-lg border-l-2 border-primary/20 pl-4">
                        Manage articles, news updates, and community content for <span className="text-foreground font-semibold">Torii Academy</span>.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/20 hidden sm:flex">
                        <div className="space-y-0.5">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-center">Total Posts</p>
                            <h3 className="text-2xl font-bold text-center text-primary">{meta?.total || 0}</h3>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group"
                    >
                        Create New Post
                        <Plus className="ml-2 size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </div>
            </div>

            <div className="space-y-6 px-0 md:px-2">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full">
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
                </div>

                <div className="rounded-3xl border border-white/20 bg-background/50 backdrop-blur-3xl overflow-hidden relative shadow-sm">
                    <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
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
                {meta && (
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-2">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-xs text-muted-foreground font-medium text-center lg:text-left pl-2">
                            <div className="inline-flex items-center gap-2">
                                <Sparkles className="size-3.5 text-primary/70" />
                                <span>Total: <span className="text-foreground">{meta.total} Published Posts</span></span>
                            </div>
                            <div className="hidden lg:block w-1 h-1 rounded-full bg-border" />
                            <div>Page {page} of {meta.totalPages}</div>
                        </div>

                        {meta.totalPages > 1 && (
                            <Pagination>
                                <PaginationContent className="flex items-center gap-2">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.max(1, p - 1));
                                            }}
                                            className={cn(
                                                "h-10 px-4 rounded-xl bg-background/50 border border-border/20 text-xs font-medium transition-all",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="hidden md:flex items-center gap-1 mx-2">
                                        {renderPaginationItems()}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.min(meta.totalPages, p + 1));
                                            }}
                                            className={cn(
                                                "h-10 px-4 rounded-xl bg-background/50 border border-border/20 text-xs font-medium transition-all",
                                                page === meta.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
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
