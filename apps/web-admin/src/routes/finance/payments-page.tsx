
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
import { Badge } from '@workspace/ui/components/badge';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import {
    Search,
    RotateCcw,
    Clock,
    Globe,
    Info
} from 'lucide-react';
import { orderApi } from '../../api/services/order-api';
import type { PaymentResponseDTO } from '@workspace/schemas';
import { formatCurrency, formatDateTime } from '../../lib/format-utils';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from "@workspace/ui/lib/utils";
import { SmartPagination } from '@/components/common/smart-pagination';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@workspace/ui/components/sheet";
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/common/page-header';

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
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Nhật ký Giao dịch"
                subtitle="Tra cứu dòng tiền và xác minh webhook SePay/PayOS"
                stats={[
                    { label: "Tổng số bản ghi", value: total.toLocaleString() }
                ]}
                actions={
                    <Button
                        onClick={loadTransactions}
                        disabled={isLoading}
                    >
                        <RotateCcw className={cn("mr-2 size-4", isLoading && "animate-spin")} />
                        Cập nhật Nhật ký
                    </Button>
                }
            />


            {/* Main Table Container */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                        <Input
                            placeholder="Tìm kiếm Mã giao dịch..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nguồn</TableHead>
                                <TableHead>Mã giao dịch</TableHead>
                                <TableHead className="text-center">Số tiền</TableHead>
                                <TableHead className="text-center">Trạng thái</TableHead>
                                <TableHead className="text-right">Thời gian xử lý</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : transactions.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={5} className="py-20 text-center">
                                        <Empty>
                                            <EmptyMedia>
                                                <Info className="size-6" />
                                            </EmptyMedia>
                                            <EmptyContent>
                                                <EmptyTitle>Không tìm thấy nhật ký giao dịch</EmptyTitle>
                                                <EmptyDescription>
                                                    Không tìm thấy bản ghi giao dịch nào khớp với bộ lọc hiện tại.
                                                </EmptyDescription>
                                            </EmptyContent>
                                        </Empty>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
                                    <TableRow
                                        key={tx.id}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setSelectedTx(tx);
                                            setIsSheetOpen(true);
                                        }}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Globe className="size-3 text-muted-foreground" />
                                                <span className="text-xs font-medium uppercase">{tx.gateway || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs font-mono">
                                                {tx.transactionId || tx.id.slice(0, 8)}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {formatCurrency(tx.amount || 0)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-medium", getStatusColor(tx.status))}>
                                                {getStatusLabel(tx.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Clock className="size-3" />
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
                <SmartPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={total}
                    onPageChange={setPage}
                    itemName="bản ghi"
                />
            </div>

            {/* Transaction Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl bg-background/95 backdrop-blur-xml border-l border-border/40 shadow-2xl p-0">
                    {selectedTx && (
                        <div className="flex flex-col h-full">
                            <SheetHeader className="px-8 py-6 border-b bg-muted/5">
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/10 text-primary border border-primary/10 rounded-full text-[10px] font-bold w-fit mb-4 uppercase tracking-wider">
                                    Bản ghi hệ thống
                                </div>
                                <SheetTitle className="text-2xl font-bold tracking-tight">Chi tiết Giao dịch</SheetTitle>
                                <SheetDescription className="text-xs font-mono text-muted-foreground/60">
                                    Mã: {selectedTx.id}
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
        </div >
    );
}
