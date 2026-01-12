import { useState, useEffect } from 'react';
import { PostPrimaryToolbar } from '@/components/posts/post-primary-toolbar.tsx';
import { PostTable } from '@/components/posts/post-table.tsx';
import { CreatePostDialog } from '@/components/posts/create-post-dialog.tsx';
import { EditPostSheet } from '@/components/posts/edit-post-sheet.tsx';
import { DeletePostDialog } from '@/components/posts/delete-post-dialog.tsx';
import { ViewPostSheet } from '@/components/posts/view-post-sheet.tsx';
import type { PostResponseDTO, PostQueryDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
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
            <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-destructive/5 rounded-[3rem] border border-dashed border-destructive/20 text-center animate-in fade-in duration-500">
                <div className="size-16 rounded-xl bg-white shadow-xl flex items-center justify-center">
                    <ShieldAlert className="size-8 text-destructive opacity-40" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight italic">Registry Failure</h3>
                    <p className="text-xs font-bold text-muted-foreground/60 italic uppercase tracking-widest">{error.message}</p>
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
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all"
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
                            "rounded-xl h-10 w-10 text-[11px] font-black transition-all",
                            page === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground/60 hover:text-primary"
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
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all"
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative px-2">
                <div className="space-y-4 max-w-2xl text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <FileText className="size-3" />
                        Content Architecture
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground uppercase italic leading-[0.85]">
                        Learning <br />
                        <span className="text-primary not-italic text-4xl sm:text-5xl">Repositories</span>
                    </h1>
                    <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] italic border-l-2 border-primary/20 pl-6 mt-6">
                        Kiến tạo và quản trị hệ sinh thái bài viết, tin tức và cập nhật cộng đồng cho <span className="text-foreground">Torii Academy</span>.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-background/40 border border-border/20 backdrop-blur-xl hidden sm:flex">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Active Assets</p>
                            <h3 className="text-2xl font-black italic text-center">{meta?.total || 0}</h3>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="w-full sm:w-auto h-14 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
                    >
                        Deploy New Article
                        <Plus className="ml-3 size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </div>
            </div>

            {/* Main Table Container */}
            <Card className="rounded-3xl bg-background/40 backdrop-blur-3xl border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden group">
                <div className="p-3 lg:p-6 space-y-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-3 lg:p-4 rounded-3xl bg-muted/20 border border-border/20">
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

                    <div className="rounded-3xl border border-border/20 bg-background/40 overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
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
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 group-hover:text-primary transition-colors">
                                    <Sparkles className="size-3" />
                                    Metric: <span className="text-foreground text-xs">{meta.total} Registered Articles</span>
                                </div>
                                <div className="hidden lg:block w-1 h-1 rounded-full bg-border" />
                                <div className="italic">Data Point 0{page} of 0{meta.totalPages}</div>
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
                                                    "h-11 px-5 rounded-xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all",
                                                    page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95"
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
                                                    "h-11 px-5 rounded-xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all",
                                                    page === meta.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95"
                                                )}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Dialogs */}
            <CreatePostDialog
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
