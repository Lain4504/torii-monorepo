
import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
    Search,
    RotateCcw,
    Database,
    Clock,
    Globe,
    Info,
    Sparkles
} from 'lucide-react';
import { orderApi } from '../../api/services/order-api';
import type { PaymentResponseDTO } from '@workspace/schemas';
import { formatCurrency, formatDateTime } from '../../lib/format-utils';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from "@workspace/ui/lib/utils";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@workspace/ui/components/sheet";
import { useSearchParams } from 'react-router-dom';

export default function TransactionsPage() {
    const [searchParams] = useSearchParams();
    const orderIdParam = searchParams.get('orderId');

    const [transactions, setTransactions] = useState<PaymentResponseDTO[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState(orderIdParam || '');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<PaymentResponseDTO | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const loadTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await orderApi.getAllTransactions({
                page,
                limit,
                transactionId: search && !search.includes('-') && search.length < 20 ? search : undefined, // search by ID or transactionId
                orderId: search && search.includes('-') && search.length > 20 ? search : undefined, // assuming uuid contains dashes
            });
            setTransactions(response.data || []);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [page, limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) setPage(1);
            else loadTransactions();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'fail':
            case 'failed':
                return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'orphan':
                return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'duplicate':
                return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default:
                return 'text-muted-foreground bg-muted/10 border-border/10';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return 'Thành công';
            case 'fail':
            case 'failed':
                return 'Thất bại';
            case 'orphan':
                return 'Giao dịch lẻ';
            case 'duplicate':
                return 'Trùng lặp';
            default:
                return status || 'Không xác định';
        }
    };

    return (
        <div className="p-4 lg:p-10 space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
                <div className="space-y-4 max-w-2xl text-center sm:text-left">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-serif font-bold italic uppercase tracking-wide">
                        <Database className="size-3.5" />
                        Hạ tầng
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Nhật ký <span className="text-primary not-italic">Giao dịch</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Tra cứu dòng tiền và xác minh webhook SePay/PayOS
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
                    <Button
                        onClick={loadTransactions}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full sm:w-auto h-11 px-6 rounded-xl font-serif font-bold italic text-xs uppercase tracking-wide border-primary/20 text-primary hover:bg-primary/5 transition-all group"
                    >
                        Cập nhật Nhật ký
                        <RotateCcw className={cn("ml-2 size-4 opacity-70 group-hover:opacity-100 transition-all", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Main Table Container */}
            <Card className="rounded-2xl bg-background/50 backdrop-blur-3xl border border-border/40 shadow-sm overflow-hidden">
                <div className="p-4 lg:p-6 space-y-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                            <Input
                                placeholder="Tìm kiếm Mã giao dịch..."
                                className="pl-10 h-11 w-full bg-background border-border/40 rounded-xl text-sm font-medium focus-visible:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-background/40 overflow-hidden relative shadow-sm">
                        <Table className="border-collapse bg-transparent">
                            <TableHeader className="bg-muted/30 border-b border-border">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">Nguồn</TableHead>
                                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">Mã giao dịch</TableHead>
                                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0 text-center">Số tiền</TableHead>
                                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0 text-center">Trạng thái</TableHead>
                                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 text-right">Thời gian xử lý</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-b border-border/50">
                                            <TableCell colSpan={5} className="py-4 px-6">
                                                <Skeleton className="h-5 w-full bg-muted/20 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground/40">
                                                <Info className="size-8 opacity-50" />
                                                <p className="text-sm font-serif font-bold italic uppercase tracking-tight">Không tìm thấy nhật ký giao dịch nào.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow
                                            key={tx.id}
                                            className="border-b border-border/40 hover:bg-muted/20 transition-all duration-200 group cursor-pointer"
                                            onClick={() => {
                                                setSelectedTx(tx);
                                                setIsSheetOpen(true);
                                            }}
                                        >
                                            <TableCell className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="size-3 text-primary/50" />
                                                    <span className="text-xs font-bold text-foreground/70 group-hover:text-primary transition-colors uppercase">{tx.gateway || 'KHÔNG XÁC ĐỊNH'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4">
                                                <code className="text-[10px] font-bold font-mono bg-primary/5 text-primary px-1.5 py-0.5 rounded transition-transform group-hover:scale-105 inline-block border border-primary/10">
                                                    {tx.transactionId || tx.id.slice(0, 8)}
                                                </code>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-center">
                                                <span className="text-sm font-bold text-foreground tabular-nums tracking-tight">
                                                    {formatCurrency(tx.amount || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-center">
                                                <Badge className={cn("text-[9px] uppercase font-bold px-2 py-0.5 border shadow-none rounded-md tracking-wider", getStatusColor(tx.status))}>
                                                    {getStatusLabel(tx.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-muted-foreground/60 text-xs font-medium tabular-nums">
                                                    <Clock className="size-3 opacity-50" />
                                                    {formatDateTime(tx.processedAt)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
                                <Sparkles className="size-3.5 text-primary/60" />
                                <span><span className="font-bold text-foreground">{total}</span> bản ghi</span>
                            </div>

                            <Pagination className="w-auto mx-0">
                                <PaginationContent className="flex items-center gap-2">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.max(1, p - 1));
                                            }}
                                            className={cn(
                                                "h-9 px-3 rounded-lg border border-border/40 text-xs font-medium transition-all hover:bg-muted/50",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:text-primary cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="flex items-center gap-1 mx-2">
                                        <span className="text-xs font-medium text-muted-foreground/60 px-2">Trang {page} trên {totalPages}</span>
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.min(totalPages, p + 1));
                                            }}
                                            className={cn(
                                                "h-9 px-3 rounded-lg border border-border/40 text-xs font-medium transition-all hover:bg-muted/50",
                                                page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:text-primary cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </Card>

            {/* Transaction Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl border-l border-border/40 shadow-2xl p-0">
                    {selectedTx && (
                        <div className="flex flex-col h-full">
                            <SheetHeader className="px-8 py-6 border-b border-border/10 bg-muted/5">
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/10 text-primary border border-primary/10 rounded-full text-[10px] font-bold w-fit mb-4 uppercase tracking-wider">
                                    Bản ghi hệ thống
                                </div>
                                <SheetTitle className="text-2xl font-serif font-bold italic uppercase tracking-tight">Chi tiết Giao dịch</SheetTitle>
                                <SheetDescription className="text-xs font-mono font-medium text-muted-foreground/60">
                                    ID: {selectedTx.id}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Cổng thanh toán</p>
                                        <p className="text-sm font-semibold text-foreground uppercase tracking-wide">{selectedTx.gateway}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Đơn hàng tham chiếu</p>
                                        <p className="text-sm font-semibold text-foreground truncate" title={selectedTx.orderId}>{selectedTx.orderId || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Số tiền</p>
                                        <p className="text-xl font-bold text-primary tracking-tight">{formatCurrency(selectedTx.amount || 0)}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Thời gian xử lý</p>
                                        <p className="text-sm font-medium text-foreground">{formatDateTime(selectedTx.processedAt)}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Nội dung giao dịch</p>
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/10 text-xs text-foreground/80 leading-relaxed italic">
                                        "{selectedTx.content || 'Không có nội dung'}"
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Dữ liệu phản hồi thô</p>
                                    <div className="relative">
                                        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] overflow-auto max-h-64 custom-scrollbar font-mono leading-normal shadow-inner">
                                            {JSON.stringify(selectedTx.rawResponse, null, 2)}
                                        </pre>
                                        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] text-slate-400 font-mono">JSON</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border/10 bg-muted/5">
                                <Button className="w-full h-11 rounded-xl font-bold uppercase tracking-wide text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all" onClick={() => setIsSheetOpen(false)}>Đóng chi tiết</Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
