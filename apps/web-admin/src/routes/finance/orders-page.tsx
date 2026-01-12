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
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  Zap,
  Clock,
  Eye,
  ExternalLink,
  ShieldAlert,
  Hash,
  Database,
  Globe,
  Wallet,
  CalendarDays,
  CreditCard, RotateCcw, ShieldCheck, TrendingUp, Activity, Search, User, Sparkles
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet";
import { orderApi } from '@/api/services/order-api.ts';
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
import { formatCurrency, formatDateTime } from '@/lib/format-utils';
import { cn } from "@workspace/ui/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";

export default function OrdersPage() {
  const [payments, setPayments] = useState<OrderResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [page]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await orderApi.getAllPayments({
        page,
        limit: 10,
      });
      setPayments(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case OrderStatus.PENDING:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case OrderStatus.FAILED:
      case OrderStatus.CANCELLED:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-border/20';
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={(e) => { e.preventDefault(); setPage(1); }}
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
            onClick={(e) => { e.preventDefault(); setPage(i); }}
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

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-20" />);
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={(e) => { e.preventDefault(); setPage(totalPages); }}
            className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all"
          >
            {totalPages}
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
            <div
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
              <CreditCard className="size-3"/>
              Vốn & Doanh Thu
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-foreground italic leading-[0.85]">
              Financial <br/>
              <span className="text-primary not-italic text-5xl sm:text-6xl">Operations</span>
            </h1>
            <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] italic border-l-2 border-primary/20 pl-6 mt-6">
              Kiểm soát dòng tiền, quản lý giao dịch và tối ưu hóa hiệu suất tài chính cho <span
                className="text-foreground text-xs">Torii Academy</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
            <div
                className="flex items-center gap-4 p-4 rounded-3xl bg-background/40 border border-border/20 backdrop-blur-xl hidden sm:flex">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Active
                  Pulses</p>
                <h3 className="text-3xl font-serif font-bold italic text-center text-primary">{total}</h3>
              </div>
            </div>
            <Button
                onClick={loadPayments}
                disabled={isLoading}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
            >
              Refresh Ledger
              <RotateCcw className={cn("ml-3 size-4 opacity-50 group-hover:opacity-100 transition-all", isLoading && "animate-spin")}/>
            </Button>
          </div>
        </div>

        {/* Stats Quick Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          {[
            {label: 'Market Volume', value: '25.4M', sub: '+12% vs last month', icon: TrendingUp, color: 'primary'},
            {label: 'Network Load', value: 'OPTIMAL', sub: 'Latency < 12ms', icon: Activity, color: 'amber-500'},
            {
              label: 'Shield Protocol',
              value: 'ACTIVE',
              sub: '99.9% Success Rate',
              icon: ShieldCheck,
              color: 'emerald-500'
            }
          ].map((stat, i) => (
              <div key={i}
                   className="group p-6 rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 hover:border-primary/20 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div
                      className={cn("p-3 rounded-2xl bg-muted/20 group-hover:scale-110 transition-transform", `text-${stat.color}`)}>
                    <stat.icon className="size-5"/>
                  </div>
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse"/>
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1">{stat.label}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-serif font-bold italic text-foreground leading-none">{stat.value}</p>
                  <span className="text-[8px] font-black text-muted-foreground/20 italic">{stat.sub}</span>
                </div>
              </div>
          ))}
        </div>

        {/* Main Table Container */}
        <Card
            className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden group">
          <div className="p-3 lg:p-6 space-y-4">
            <div
                className="flex flex-col lg:flex-row items-center justify-between gap-4 p-3 lg:p-4 rounded-[2rem] bg-muted/20 border border-border/20">
              <div className="relative flex-1 w-full">
                <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors"/>
                <Input
                    placeholder="Tìm kiếm giao dịch (ID, User...)"
                    className="pl-12 h-12 w-full bg-background/60 border-transparent focus:border-primary/20 rounded-2xl transition-all text-[11px] font-bold uppercase tracking-widest placeholder:text-muted-foreground/20 shadow-none ring-0 focus-visible:ring-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-border/20 bg-background/40 overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none"/>
              <Table>
                <TableHeader className="bg-muted/10 border-b border-border/20">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead
                        className="h-12 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Sequence</TableHead>
                    <TableHead
                        className="h-12 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Identity</TableHead>
                    <TableHead
                        className="h-12 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6 text-center">Valuation</TableHead>
                    <TableHead
                        className="h-12 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6 text-center">Protocol</TableHead>
                    <TableHead
                        className="h-12 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6 text-center">Status</TableHead>
                    <TableHead
                        className="h-12 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6 text-right">Sync
                      Cycle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                      Array.from({length: 5}).map((_, i) => (
                          <TableRow key={i} className="border-b border-border/10">
                            <TableCell colSpan={6} className="py-6 px-6">
                              <Skeleton className="h-4 w-full bg-muted/20 rounded-md"/>
                            </TableCell>
                          </TableRow>
                      ))
                  ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center p-12 space-y-6">
                            <div
                                className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center border border-border/40 relative">
                              <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full"/>
                              <CreditCard className="size-10 text-muted-foreground/20 relative z-10"/>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground/40">Ledger
                                Empty</h3>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">No
                                transactions detected in the local hub.</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : (
                      payments.map((payment) => (
                          <TableRow
                              key={payment.id}
                              className="border-b border-border/10 hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                              onClick={() => {
                                setSelectedOrder(payment);
                                setIsSheetOpen(true);
                              }}
                          >
                            <TableCell className="py-4 px-6">
                              <div
                                  className="text-[10px] font-black italic text-muted-foreground/30 tabular-nums">0{payments.indexOf(payment) + 1}</div>
                              <div
                                  className="text-[9px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tighter">ID: {payment.id.slice(0, 8)}</div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                  <User className="w-3.5 h-3.5"/>
                                </div>
                                <span
                                    className="text-[11px] font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {payment.userId.slice(0, 8)}...
                          </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-center">
                        <span
                            className="font-serif font-bold italic text-[16px] text-foreground tabular-nums tracking-tight text-primary">
                          {formatCurrency(payment.amount)}
                        </span>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-center">
                              <div
                                  className="inline-flex items-center px-3 py-1 rounded-full bg-muted/20 border border-border/20 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                <Zap className="size-3 mr-1.5 opacity-40 text-primary"/>
                                {payment.paymentMethod}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-center">
                              <div
                                  className={cn("inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm", getStatusColor(payment.status))}>
                                <div
                                    className={cn("size-1 rounded-full mr-2", payment.status === OrderStatus.COMPLETED ? 'bg-emerald-500 animate-pulse' : 'bg-current')}/>
                                {payment.status}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right relative">
                              <div
                                  className="flex items-center justify-end gap-2 text-muted-foreground/40 tabular-nums text-[10px] font-bold italic group-hover:opacity-0 transition-opacity">
                                <Clock className="size-3 opacity-40"/>
                                {formatDateTime(payment.createdAt)}
                              </div>
                              <div
                                  className="absolute inset-y-0 right-6 flex items-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <div
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest">
                                  <Eye className="size-3"/>
                                  Inspect
                                </div>
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
                <div
                    className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
                  <div
                      className="flex flex-col lg:flex-row lg:items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 group-hover:text-primary transition-colors">
                      <Sparkles className="size-3"/>
                      Metric: <span className="text-foreground text-xs">{total} Registry Entries</span>
                    </div>
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
                              setPage(p => Math.min(totalPages, p + 1));
                            }}
                            className={cn(
                                "h-11 px-5 rounded-xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all",
                                page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95"
                            )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
            )}
          </div>
        </Card>

        {/* Order Detail Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent
              className="sm:max-w-xl p-0 border-l border-border/20 bg-background/95 backdrop-blur-2xl rounded-l-[3rem]">
            {selectedOrder && (
                <div className="h-full flex flex-col">
                  {/* Sheet Header Overlay */}
                  <div className="relative h-48 bg-primary/5 border-b border-border/10 overflow-hidden shrink-0">
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 rotate-12">
                      <CreditCard className="size-64"/>
                    </div>

                    <div className="absolute bottom-8 left-10 space-y-2">
                      <div
                          className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <Hash className="size-3"/>
                        Reference: {selectedOrder.id.slice(0, 12)}
                      </div>
                      <h2 className="text-4xl font-serif font-bold italic text-foreground leading-none">Transaction
                        Details</h2>
                    </div>
                  </div>

                  {/* Sheet Body */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                    {/* Main Grid */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <div
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                          <User className="size-3"/>
                          Identity
                        </div>
                        <p className="text-sm font-bold text-foreground">User {selectedOrder.userId.slice(0, 16)}...</p>
                      </div>
                      <div className="space-y-1.5">
                        <div
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                          <Database className="size-3"/>
                          Protocol
                        </div>
                        <p className="text-sm font-bold text-foreground uppercase tracking-tighter">{selectedOrder.paymentMethod}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                          <Globe className="size-3"/>
                          Execution Hub
                        </div>
                        <p className="text-sm font-bold text-foreground italic">Torii-Mainnet-Node-01</p>
                      </div>
                      <div className="space-y-1.5">
                        <div
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                          <CalendarDays className="size-3"/>
                          Sync Cycle
                        </div>
                        <p className="text-sm font-bold text-foreground italic">{formatDateTime(selectedOrder.createdAt)}</p>
                      </div>
                    </div>

                    {/* Financial Stats */}
                    <div className="p-8 rounded-[2.5rem] bg-muted/20 border border-border/10 space-y-6">
                      <div className="flex items-center justify-between border-b border-border/10 pb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Ledger
                            Entry Type</p>
                          <h4 className="text-sm font-bold text-foreground italic">Course Subscription Purchase</h4>
                        </div>
                        <div
                            className={cn("px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm flex items-center gap-2", getStatusColor(selectedOrder.status))}>
                          <div
                              className={cn("size-1.5 rounded-full", selectedOrder.status === OrderStatus.COMPLETED ? 'bg-emerald-500 animate-pulse' : 'bg-current')}/>
                          {selectedOrder.status}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center text-muted-foreground/60">
                          <span className="text-[11px] font-bold uppercase tracking-widest italic">Base Valuation</span>
                          <span className="font-serif font-bold italic">{formatCurrency(selectedOrder.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground/60">
                          <span className="text-[11px] font-bold uppercase tracking-widest italic">Network Fee</span>
                          <span className="font-serif font-bold italic">{formatCurrency(0)}</span>
                        </div>
                        <div className="pt-6 border-t border-border/10 flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Total Disbursement</span>
                          <span
                              className="text-3xl font-serif font-bold italic text-foreground tracking-tight">{formatCurrency(selectedOrder.amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Alert */}
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4">
                      <ShieldAlert className="size-5 text-primary shrink-0"/>
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Audit Log
                          Verification</h5>
                        <p className="text-[11px] font-bold text-muted-foreground/60 italic leading-relaxed">
                          This transaction has been cryptographically signed and verified by the Torii Guardian
                          Protocol. Any discrepancies should be reported to the Finance Node operator immediately.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sheet Footer */}
                  <div className="p-10 border-t border-border/10 shrink-0">
                    <Button
                        className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
                        onClick={() => setIsSheetOpen(false)}
                    >
                      Sync to local registry
                      <ExternalLink className="ml-3 size-4 opacity-50 group-hover:opacity-100 transition-all"/>
                    </Button>
                  </div>
                </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
  );
}
