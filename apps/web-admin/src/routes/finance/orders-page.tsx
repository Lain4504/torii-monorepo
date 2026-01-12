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

  CalendarDays,
  CreditCard, RotateCcw, ShieldCheck, TrendingUp, Activity, Search, User, Sparkles
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
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
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case OrderStatus.PENDING:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case OrderStatus.FAILED:
      case OrderStatus.CANCELLED:
        return 'bg-red-500/10 text-red-600 border-red-500/20';
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
            onClick={(e) => { e.preventDefault(); setPage(i); }}
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

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-20" />);
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={(e) => { e.preventDefault(); setPage(totalPages); }}
            className="rounded-xl h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all"
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
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide">
            <CreditCard className="size-3.5" />
            Finance & Revenue
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
            Financial <span className="text-primary italic">Overview</span>
          </h1>
          <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg border-l-2 border-primary/20 pl-4 mt-4">
            Monitor cash flow, manage transactions, and optimize financial performance for <span
              className="text-foreground font-medium">Torii Academy</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
          <div
            className="flex items-center gap-4 p-4 rounded-2xl bg-background/60 border border-border/20 backdrop-blur-xl hidden sm:flex shadow-sm">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center">Total Transactions</p>
              <h3 className="text-2xl font-serif font-medium text-center text-primary">{total}</h3>
            </div>
          </div>
          <Button
            onClick={loadPayments}
            disabled={isLoading}
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group"
          >
            Refresh Data
            <RotateCcw className={cn("ml-2 size-4 opacity-70 group-hover:opacity-100 transition-all", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        {[
          { label: 'Total Revenue', value: '25.4M', sub: '+12% vs last month', icon: TrendingUp, color: 'primary' },
          { label: 'System Status', value: 'Optimal', sub: 'Latency < 12ms', icon: Activity, color: 'amber-500' },
          {
            label: 'Security Status',
            value: 'Active',
            sub: '99.9% Success Rate',
            icon: ShieldCheck,
            color: 'emerald-500'
          }
        ].map((stat, i) => (
          <div key={i}
            className="group p-6 rounded-[2rem] bg-background/50 backdrop-blur-3xl border border-white/20 hover:border-primary/20 transition-all duration-500 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn("p-3 rounded-2xl bg-muted/20 group-hover:scale-105 transition-transform", `text-${stat.color}`)}>
                <stat.icon className="size-5" />
              </div>
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{stat.label}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-serif font-medium text-foreground leading-none">{stat.value}</p>
              <span className="text-[10px] font-medium text-muted-foreground/60">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <Card
        className="rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-white/20 shadow-xl shadow-black/5 overflow-hidden group">
        <div className="p-4 lg:p-8 space-y-6">
          <div
            className="flex flex-col lg:flex-row items-center justify-between gap-4 p-1 rounded-2xl">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search transactions (ID, User...)"
                className="pl-11 h-11 w-full bg-background/40 border-border/20 focus:border-primary/20 rounded-xl transition-all text-sm font-medium placeholder:text-muted-foreground/40 shadow-none ring-0 focus-visible:ring-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-background/40 overflow-hidden relative shadow-sm">
            <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
            <Table>
              <TableHeader className="bg-muted/5 border-b border-border/10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead
                    className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6">No</TableHead>
                  <TableHead
                    className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6">User</TableHead>
                  <TableHead
                    className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6 text-center">Amount</TableHead>
                  <TableHead
                    className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6 text-center">Method</TableHead>
                  <TableHead
                    className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6 text-center">Status</TableHead>
                  <TableHead
                    className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-border/5">
                      <TableCell colSpan={6} className="py-4 px-6">
                        <Skeleton className="h-4 w-full bg-muted/20 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div
                          className="w-16 h-16 rounded-2xl bg-muted/10 flex items-center justify-center border border-white/10 relative">
                          <CreditCard className="size-8 text-muted-foreground/30 relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium text-foreground/60">No Transactions Found</h3>
                          <p className="text-xs text-muted-foreground/40">
                            No transaction records available.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="border-b border-border/5 hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(payment);
                        setIsSheetOpen(true);
                      }}
                    >
                      <TableCell className="py-3 px-6">
                        <div
                          className="text-xs font-medium text-muted-foreground/60 tabular-nums">0{payments.indexOf(payment) + 1}</div>
                        <div
                          className="text-[10px] font-medium text-muted-foreground/40 mt-0.5 uppercase tracking-wide">ID: {payment.id.slice(0, 8)}</div>
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/70 group-hover:scale-105 transition-transform">
                            <User className="w-4 h-4" />
                          </div>
                          <span
                            className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                            {payment.userId.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-center">
                        <span
                          className="font-serif font-medium text-sm text-foreground tabular-nums tracking-tight">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-center">
                        <div
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted/10 border border-border/10 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                          <Zap className="size-3 mr-1.5 opacity-50 text-primary" />
                          {payment.paymentMethod}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-center">
                        <div
                          className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border shadow-sm", getStatusColor(payment.status))}>
                          <div
                            className={cn("size-1.5 rounded-full mr-2", payment.status === OrderStatus.COMPLETED ? 'bg-emerald-500' : 'bg-current')} />
                          {payment.status}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-right relative">
                        <div
                          className="flex items-center justify-end gap-2 text-muted-foreground/50 tabular-nums text-[11px] font-medium transition-opacity">
                          <Clock className="size-3 opacity-40" />
                          {formatDateTime(payment.createdAt)}
                        </div>
                        <div
                          className="absolute inset-y-0 right-6 flex items-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-medium uppercase tracking-wide shadow-sm">
                            <Eye className="size-3" />
                            View
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
              className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-2">
              <div
                className="flex flex-col lg:flex-row lg:items-center gap-4 text-xs text-muted-foreground font-medium text-center lg:text-left pl-2">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="size-3.5 text-primary/70" />
                  <span>Total: <span className="text-foreground">{total} Transactions</span></span>
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

      {/* Order Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          className="sm:max-w-xl p-0 border-l border-white/10 bg-background/95 backdrop-blur-3xl rounded-l-[2rem]">
          {selectedOrder && (
            <div className="h-full flex flex-col">
              {/* Sheet Header Overlay */}
              <div className="relative h-40 bg-primary/5 border-b border-border/10 overflow-hidden shrink-0">
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 rotate-12">
                  <CreditCard className="size-64" />
                </div>

                <div className="absolute bottom-8 left-10 space-y-2">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 text-primary-foreground/80 rounded-full text-[10px] font-medium tracking-wide">
                    <Hash className="size-3" />
                    Order ID: {selectedOrder.id.slice(0, 12)}
                  </div>
                  <h2 className="text-3xl font-serif font-medium italic text-foreground leading-none">Order
                    Details</h2>
                </div>
              </div>

              {/* Sheet Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {/* Main Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      <User className="size-3.5" />
                      User
                    </div>
                    <p className="text-sm font-medium text-foreground">User {selectedOrder.userId.slice(0, 16)}...</p>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      <Database className="size-3.5" />
                      Method
                    </div>
                    <p className="text-sm font-medium text-foreground uppercase tracking-wide">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      <Globe className="size-3.5" />
                      Platform
                    </div>
                    <p className="text-sm font-medium text-foreground italic">Torii Academy Web</p>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      <CalendarDays className="size-3.5" />
                      Date
                    </div>
                    <p className="text-sm font-medium text-foreground italic">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                {/* Financial Stats */}
                <div className="p-6 rounded-[2rem] bg-muted/30 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Transaction Type</p>
                      <h4 className="text-sm font-medium text-foreground italic">Course Subscription</h4>
                    </div>
                    <div
                      className={cn("px-3 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-wide border shadow-sm flex items-center gap-2", getStatusColor(selectedOrder.status))}>
                      <div
                        className={cn("size-1.5 rounded-full", selectedOrder.status === OrderStatus.COMPLETED ? 'bg-emerald-500' : 'bg-current')} />
                      {selectedOrder.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-muted-foreground/70">
                      <span className="text-[11px] font-medium uppercase tracking-wide">Base Amount</span>
                      <span className="font-serif font-medium">{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground/70">
                      <span className="text-[11px] font-medium uppercase tracking-wide">Fee</span>
                      <span className="font-serif font-medium">{formatCurrency(0)}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-xs font-medium uppercase tracking-wider text-primary">Total Amount</span>
                      <span
                        className="text-2xl font-serif font-medium italic text-foreground tracking-tight">{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
                  <ShieldCheck className="size-5 text-primary/70 shrink-0" />
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-medium uppercase tracking-wider text-primary">Transaction Verification</h5>
                    <p className="text-[11px] font-medium text-muted-foreground/70 leading-relaxed">
                      This transaction has been verified and recorded by the system.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sheet Footer */}
              <div className="p-8 border-t border-border/10 shrink-0">
                <Button
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium uppercase tracking-wide text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
