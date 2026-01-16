
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
    Info
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
            setTransactions(response.data);
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

    return (
        <div className="p-4 lg:p-10 space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
                <div className="space-y-4 max-w-2xl text-center sm:text-left">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide">
                        <Database className="size-3.5" />
                        System Logs
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
                        Transaction <span className="text-primary italic">Logs</span>
                    </h1>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg border-l-2 border-primary/20 pl-4 mt-4">
                        Raw incoming transaction data from payment gateways. Use this to trace payments and verify <span
                            className="text-foreground font-medium">SePay/PayOS</span> webhooks.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
                    <Button
                        onClick={loadTransactions}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full sm:w-auto h-12 px-6 rounded-xl font-medium text-sm transition-all group"
                    >
                        Refresh Logs
                        <RotateCcw className={cn("ml-2 size-4 opacity-70 group-hover:opacity-100 transition-all", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Main Table Container */}
            <Card className="rounded-2xl bg-background/50 backdrop-blur-3xl border border-white/20 shadow-xl overflow-hidden">
                <div className="p-4 lg:p-8 space-y-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                            <Input
                                placeholder="Search Transaction ID..."
                                className="pl-11 h-11 w-full bg-background/40 border-border/20 rounded-lg text-sm font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/20 bg-background/40 overflow-hidden relative">
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="border-none">
                                    <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6">Source</TableHead>
                                    <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6">Transaction ID</TableHead>
                                    <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6 text-center">Amount</TableHead>
                                    <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6 text-center">Status</TableHead>
                                    <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6 text-right">Processed At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-b border-border/5">
                                            <TableCell colSpan={5} className="py-4 px-6">
                                                <Skeleton className="h-4 w-full bg-muted/20 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground/40">
                                                <Info className="size-8" />
                                                <p>No transaction logs found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow
                                            key={tx.id}
                                            className="border-b border-border/5 hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                                            onClick={() => {
                                                setSelectedTx(tx);
                                                setIsSheetOpen(true);
                                            }}
                                        >
                                            <TableCell className="py-3 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="size-3 text-primary/50" />
                                                    <span className="text-xs font-medium uppercase">{tx.gateway || 'Unknown'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-6">
                                                <code className="text-[10px] font-mono bg-muted/30 px-1.5 py-0.5 rounded text-primary/70">
                                                    {tx.transactionId || tx.id.slice(0, 8)}
                                                </code>
                                            </TableCell>
                                            <TableCell className="py-3 px-6 text-center">
                                                <span className="font-serif font-medium text-sm">
                                                    {formatCurrency(tx.amount || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3 px-6 text-center">
                                                <Badge className={cn("text-[10px] uppercase font-bold px-2 py-0 border shadow-none", getStatusColor(tx.status))}>
                                                    {tx.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-muted-foreground/50 text-[11px]">
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
                    {totalPages > 1 && (
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4">
                            <div className="text-xs text-muted-foreground font-medium">
                                <span>Total: <span className="text-foreground">{total} Log Entries</span></span>
                            </div>

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

                                    <div className="flex items-center gap-1 mx-2">
                                        <span className="text-xs font-medium text-muted-foreground">Page {page} of {totalPages}</span>
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.min(totalPages, p + 1));
                                            }}
                                            className={cn(
                                                "h-10 px-4 rounded-xl bg-background/50 border border-border/20 text-xs font-medium transition-all",
                                                page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
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
                <SheetContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl">
                    {selectedTx && (
                        <div className="flex flex-col h-full">
                            <SheetHeader className="pb-6 border-b border-border/10">
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold w-fit mb-4">
                                    LOG ENTRY
                                </div>
                                <SheetTitle className="text-3xl font-serif font-bold italic">Transaction Details</SheetTitle>
                                <SheetDescription className="text-xs uppercase font-medium text-muted-foreground/60">
                                    ID: {selectedTx.id}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto py-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Gateway</p>
                                        <p className="text-sm font-medium">{selectedTx.gateway}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Reference Order</p>
                                        <p className="text-sm font-medium">{selectedTx.orderId || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Amount</p>
                                        <p className="text-lg font-serif font-bold italic text-primary">{formatCurrency(selectedTx.amount || 0)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Processed At</p>
                                        <p className="text-sm font-medium">{formatDateTime(selectedTx.processedAt)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Description / Content</p>
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/10 text-xs text-foreground/80 leading-relaxed italic">
                                        "{selectedTx.content || 'No content provided'}"
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Raw Response Data</p>
                                    <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-[10px] overflow-auto max-h-64 custom-scrollbar font-mono leading-normal">
                                        {JSON.stringify(selectedTx.rawResponse, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/10">
                                <Button className="w-full h-12 rounded-xl" onClick={() => setIsSheetOpen(false)}>Close Log</Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
