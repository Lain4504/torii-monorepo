import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import type { QuestionPoolQueryDTO, QuestionPoolResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useQuestionPools } from "@/api/services/question-pools.ts";
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
import { QuestionJlptLevel } from '@workspace/schemas';
import { Input } from '@workspace/ui/components/input';
import { Search, Plus, Target, Zap, FileQuestion, Pencil, Trash, Eye, Sparkles, Inbox } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Card } from '@workspace/ui/components/card';
import { CreateQuestionPoolDialog } from '@/components/question-pools/create-question-pool-dialog.tsx';
import { EditQuestionPoolDialog } from '@/components/question-pools/edit-question-pool-dialog.tsx';
import { ViewQuestionPoolDialog } from '@/components/question-pools/view-question-pool-dialog.tsx';
import { DeleteQuestionPoolDialog } from '@/components/question-pools/delete-question-pool-dialog.tsx';
import { useQuestionsByPool } from '@/api/services/questions.ts';

import { PageHeader } from '@/components/common/page-header';

export default function QuestionPoolsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [viewingPool, setViewingPool] = useState<QuestionPoolResponseDTO | null>(null);
    const [editingPool, setEditingPool] = useState<QuestionPoolResponseDTO | null>(null);
    const [deletingPool, setDeletingPool] = useState<QuestionPoolResponseDTO | null>(null);

    const queryParams: QuestionPoolQueryDTO = {
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as QuestionJlptLevel }),
    };

    const { data: poolsData, isLoading, error } = useQuestionPools(queryParams);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, jlptLevelFilter]);

    const pools = poolsData?.data || [];
    const meta = poolsData ? {
        total: poolsData.total,
        totalPages: poolsData.totalPages,
        page: poolsData.page,
        limit: poolsData.limit
    } : null;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="w-20 h-20 rounded-[2.5rem] bg-destructive/5 flex items-center justify-center border border-dashed border-destructive/20">
                    <Target className="size-10 text-destructive/40" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-destructive/60">Sync Error</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">{error.message}</p>
                </div>
            </div>
        );
    }

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
                        onClick={() => setPage(1)}
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all cursor-pointer"
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
                        onClick={() => setPage(i)}
                        className={cn(
                            "rounded-xl h-10 w-10 text-[11px] font-black transition-all cursor-pointer",
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
                        onClick={() => setPage(meta.totalPages)}
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all cursor-pointer"
                    >
                        {meta.totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 lg:px-6">
            <PageHeader
                title="Quản lý Kho đề"
                subtitle="Quản lý các kho đề thi và ngân hàng câu hỏi Torii"
                stats={[
                    { label: "Tổng số kho đề", value: meta?.total.toLocaleString() || 0 }
                ]}
                actions={
                    <Can permission="question_pool.create">
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
                        >
                            <Plus className="mr-2 size-4" />
                            Tạo Kho đề mới
                        </Button>
                    </Can>
                }
            />


            {/* Matrix Filters */}
            <Card className="rounded-[2.5rem] bg-card border border-border/20 p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="TÌM KIẾM MÃ KHO ĐỀ HOẶC TÊN..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-14 pl-12 rounded-2xl border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-[11px] font-black uppercase tracking-widest placeholder:text-muted-foreground/20"
                        />
                    </div>
                    <Select
                        value={jlptLevelFilter || 'all'}
                        onValueChange={(value) =>
                            setJlptLevelFilter(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="h-14 sm:w-[220px] px-6 rounded-2xl border-border/10 bg-muted/20 hover:bg-muted/30 focus:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                                <Target className="size-4 opacity-30" />
                                <SelectValue placeholder="CẤP ĐỘ JLPT" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[2rem] p-2">
                            <SelectItem value="all" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">TẤT CẢ CẤP ĐỘ</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N5} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N5 CƠ BẢN</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N4} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N4 SƠ CẤP</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N3} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N3 TRUNG CẤP</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N2} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N2 CAO CẤP</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N1} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N1 THUẦN THỤC</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Registry Table */}
            <Card className="rounded-[3rem] bg-card border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-[1000px] border-collapse bg-transparent">
                        <TableHeader className="bg-muted/10 border-b border-border/20">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-8">#</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Tên Kho đề</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Mô tả tóm tắt</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Cấp độ</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Số lượng câu hỏi</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-8 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index} className="border-b border-border/10">
                                        <TableCell className="px-8 py-6"><Skeleton className="h-4 w-10 bg-muted/20 rounded-xl" /></TableCell>
                                        <TableCell className="px-6 py-6"><Skeleton className="h-6 w-48 bg-muted/20 rounded-xl" /></TableCell>
                                        <TableCell className="px-6 py-6"><Skeleton className="h-4 w-full bg-muted/20 rounded-xl" /></TableCell>
                                        <TableCell className="px-6 py-6"><Skeleton className="h-8 w-20 bg-muted/20 rounded-full" /></TableCell>
                                        <TableCell className="px-6 py-6"><Skeleton className="h-6 w-24 bg-muted/20 rounded-xl" /></TableCell>
                                        <TableCell className="px-8 py-6 text-right"><Skeleton className="h-10 w-10 bg-muted/20 rounded-2xl ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : pools.length > 0 ? (
                                pools.map((pool, index) => (
                                    <PoolRow
                                        key={pool.id}
                                        pool={pool}
                                        index={index}
                                        page={page}
                                        onView={() => setViewingPool(pool)}
                                        onEdit={() => setEditingPool(pool)}
                                        onDelete={() => setDeletingPool(pool)}
                                    />
                                ))
                            ) : (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center p-12 space-y-6">
                                            <div className="w-20 h-20 rounded-[1.5rem] bg-muted/20 flex items-center justify-center border border-border/40 relative">
                                                <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                                <Inbox className="size-10 text-muted-foreground/20 relative z-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold uppercase tracking-tight text-foreground/40">Kho lưu trữ trống</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20">Không tìm thấy kho đề nào trong hệ thống.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Meta */}
                {meta && (
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-10 border-t border-border/10">
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                            <div className="inline-flex items-center gap-2">
                                <Sparkles className="size-3" />
                                Danh sách: <span className="text-foreground text-xs">{meta.total} Kho đề</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <div className="italic">Dữ liệu trang 0{page} / 0{meta.totalPages}</div>
                        </div>

                        {meta.totalPages > 1 && (
                            <Pagination>
                                <PaginationContent className="flex items-center gap-2">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={cn(
                                                "h-12 px-6 rounded-2xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary active:scale-95"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="hidden md:flex items-center gap-1 mx-2">
                                        {renderPaginationItems()}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                            className={cn(
                                                "h-12 px-6 rounded-2xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                                page === meta.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary active:scale-95"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </Card>

            {/* Dialogs */}
            <CreateQuestionPoolDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <ViewQuestionPoolDialog
                open={!!viewingPool}
                onOpenChange={(open) => !open && setViewingPool(null)}
                pool={viewingPool}
                onEdit={(pool) => {
                    setViewingPool(null);
                    setEditingPool(pool);
                }}
            />

            <EditQuestionPoolDialog
                open={!!editingPool}
                onOpenChange={(open) => !open && setEditingPool(null)}
                pool={editingPool}
            />

            <DeleteQuestionPoolDialog
                open={!!deletingPool}
                onOpenChange={(open) => !open && setDeletingPool(null)}
                pool={deletingPool}
            />
        </div>
    );
}

// Pool Row Component with Question Count
function PoolRow({
    pool,
    index,
    page,
    onView,
    onEdit,
    onDelete,
}: {
    pool: QuestionPoolResponseDTO;
    index: number;
    page: number;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { data: questions } = useQuestionsByPool(pool.id);
    const questionCount = questions?.length || 0;

    return (
        <TableRow
            key={pool.id}
            className="border-b border-border/10 hover:bg-primary/[0.02] transition-all duration-500 group"
        >
            <TableCell className="px-8 font-bold text-muted-foreground/30 tabular-nums text-[10px]">
                {((page - 1) * 10 + index + 1) < 10 ? `0${(page - 1) * 10 + index + 1}` : (page - 1) * 10 + index + 1}
            </TableCell>
            <TableCell className="px-6">
                <div className="flex flex-col gap-1">
                    <div className="font-bold text-[14px] text-foreground/80 group-hover:text-primary transition-colors uppercase tracking-tight">{pool.name}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">UID: {pool.id.slice(0, 8)}</div>
                </div>
            </TableCell>
            <TableCell className="px-6 max-w-[300px]">
                <div className="truncate text-[12px] font-bold text-foreground/60 leading-relaxed group-hover:text-foreground transition-colors">{pool.description || 'CHƯA CÓ MÔ TẢ'}</div>
            </TableCell>
            <TableCell className="px-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-bold text-primary">
                    {pool.jlptLevel || '??'}
                </div>
            </TableCell>
            <TableCell className="px-6">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-muted/20 text-muted-foreground/40 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                        <FileQuestion className="size-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold leading-none">{questionCount}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">CÂU HỎI</span>
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-8 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all data-[state=open]:bg-primary/20"
                        >
                            <Zap className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-[200px] border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2"
                    >
                        <DropdownMenuItem
                            onClick={onView}
                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                        >
                            <Eye className="h-4 w-4 opacity-30" />
                            <span>Xem chi tiết</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onEdit}
                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                        >
                            <Pencil className="h-4 w-4 opacity-30" />
                            <span>Điều chỉnh kho đề</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/20 mx-2" />
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex gap-3"
                        >
                            <Trash className="h-4 w-4 opacity-30" />
                            <span>Xóa kho đề</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
