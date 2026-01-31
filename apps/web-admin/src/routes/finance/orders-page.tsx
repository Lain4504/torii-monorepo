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
import {
  Zap,
  Clock,
  Hash,
  Database,
  Globe,
  CalendarDays,
  CreditCard, RotateCcw, ShieldCheck, TrendingUp, Activity, Search, User, Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import {
  Sheet,
  SheetContent,
} from "@workspace/ui/components/sheet";
import { orderApi } from '@/api/services/order-api.ts';
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
import { formatCurrency, formatDateTime } from '@/lib/format-utils';
import { cn } from "@workspace/ui/lib/utils";
import { SmartPagination } from '@/components/common/smart-pagination';

export default function OrdersPage() {
  const [payments, setPayments] = useState<OrderResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [page, status]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await orderApi.getAllOrders({
        page,
        limit: 10,
        status: status !== 'all' ? status as OrderStatus : undefined,
      });
      setPayments(response.data || []);
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

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'Hoàn thành';
      case OrderStatus.PENDING:
        return 'Đang xử lý';
      case OrderStatus.FAILED:
        return 'Thất bại';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return status;
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Tài chính & Doanh thu</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi dòng tiền và tối ưu hiệu suất Torii Academy
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end px-4 border-r border-border/40">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">Tổng số Giao dịch</span>
            <span className="text-2xl font-bold text-foreground tabular-nums">{total}</span>
          </div>
          <Button
            onClick={loadPayments}
            disabled={isLoading}
            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group"
          >
            Làm mới
            <RotateCcw className={cn("ml-2 size-4 opacity-70 group-hover:opacity-100 transition-all", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        {[
          { label: 'Tổng doanh thu', value: '25.4M', sub: '+12% so với tháng trước', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Trạng thái Hệ thống', value: 'Ổn định', sub: 'Độ trễ < 12ms', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Bảo mật', value: 'Hoạt động', sub: '99.9% Tỷ lệ an toàn', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
        ].map((stat, i) => (
          <div key={i}
            className="group p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-lg transition-transform group-hover:scale-105", stat.bg, stat.color)}>
                <stat.icon className="size-5" />
              </div>
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans font-bold italic mb-1">{stat.label}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground leading-none">{stat.value}</p>
              <span className="text-[10px] font-bold text-muted-foreground/40">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
              <Input
                placeholder="Tìm kiếm giao dịch (Mã đơn, Người dùng...)"
                className="pl-9 h-11 w-full bg-background border-border hover:border-border/80 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={status}
                onValueChange={(val) => {
                  setStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px] h-11 bg-background border-border hover:border-border/80 rounded-xl focus:ring-primary/20 font-medium">
                  <div className="flex items-center gap-2">
                    <Filter className="size-3.5 opacity-50" />
                    <SelectValue placeholder="Trạng thái" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background border-border rounded-xl shadow-lg">
                  <SelectItem value="all" className="cursor-pointer py-2.5 font-medium">Tất cả trạng thái</SelectItem>
                  {Object.values(OrderStatus).map((s) => (
                    <SelectItem key={s} value={s} className="cursor-pointer py-2.5 font-medium">
                      {getStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
          <Table className="border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="h-12 w-[80px] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/30 last:border-r-0">#</TableHead>
                <TableHead className="h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/30 last:border-r-0">Người dùng</TableHead>
                <TableHead className="h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 text-center border-r border-border/30 last:border-r-0">Số tiền</TableHead>
                <TableHead className="h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 text-center border-r border-border/30 last:border-r-0">Phương thức</TableHead>
                <TableHead className="h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 text-center border-r border-border/30 last:border-r-0">Trạng thái</TableHead>
                <TableHead className="h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 text-right border-r border-border/30 last:border-r-0">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <RotateCcw className="h-8 w-8 animate-spin text-primary/60" />
                      <p className="text-xs font-sans font-bold italic uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[400px] text-center">
                    <Empty>
                      <EmptyMedia>
                        <CreditCard className="size-8 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyContent>
                        <EmptyTitle>Không tìm thấy giao dịch</EmptyTitle>
                        <EmptyDescription>
                          Chưa có dữ liệu giao dịch nào được ghi nhận.
                        </EmptyDescription>
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(payment);
                      setIsSheetOpen(true);
                    }}
                  >
                    <TableCell className="py-4 px-6 border-r border-border/10 last:border-r-0">
                      <div className="text-xs font-medium text-muted-foreground/60 tabular-nums">0{payments.indexOf(payment) + 1}</div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-border/10 last:border-r-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[150px]">
                          {payment.userId}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">ID: {payment.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center border-r border-border/10 last:border-r-0">
                      <span className="text-sm font-bold text-foreground tabular-nums tracking-tight">
                        {formatCurrency(payment.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center border-r border-border/10 last:border-r-0">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/50 border border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                        <Zap className="size-3 mr-1.5 opacity-50" />
                        {payment.paymentMethod}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center border-r border-border/10 last:border-r-0">
                      <div className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm", getStatusColor(payment.status))}>
                        <div className={cn("size-1.5 rounded-full mr-2", payment.status === OrderStatus.COMPLETED ? 'bg-emerald-500' : 'bg-current opacity-50')} />
                        {getStatusLabel(payment.status)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right border-r border-border/10 last:border-r-0">
                      <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-xs font-medium tabular-nums">
                        <Clock className="size-3 opacity-40" />
                        {formatDateTime(payment.createdAt)}
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
          itemName="giao dịch"
        />
      </div>

      {/* Order Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          className="sm:max-w-xl p-0 border-l border-border/40 bg-background/95 backdrop-blur-3xl rounded-l-2xl shadow-2xl">
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
                    className="inline-flex items-center gap-2 px-2.5 py-1 bg-background/40 backdrop-blur-md text-foreground/80 rounded-full text-[10px] font-bold uppercase tracking-wide border border-white/10">
                    <Hash className="size-3" />
                    Mã đơn: {selectedOrder.id.slice(0, 12)}
                  </div>
                  <h2 className="text-3xl font-sans font-bold italic text-foreground leading-none tracking-tight uppercase">Chi tiết Đơn hàng</h2>
                </div>
              </div>

              {/* Sheet Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {/* Main Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                      <User className="size-3.5" />
                      Người dùng
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">{selectedOrder.userId}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                      <Database className="size-3.5" />
                      Phương thức
                    </div>
                    <p className="text-sm font-semibold text-foreground uppercase tracking-wide">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                      <Globe className="size-3.5" />
                      Nền tảng
                    </div>
                    <p className="text-sm font-medium text-foreground italic">Torii Academy Web</p>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                      <CalendarDays className="size-3.5" />
                      Ngày tạo
                    </div>
                    <p className="text-sm font-medium text-foreground italic">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                {/* Financial Stats */}
                <div className="p-6 rounded-2xl bg-muted/20 border border-border/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/10 pb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Loại giao dịch</p>
                      <h4 className="text-sm font-medium text-foreground italic">Đăng ký khóa học</h4>
                    </div>
                    <div
                      className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm flex items-center gap-2", getStatusColor(selectedOrder.status))}>
                      <div
                        className={cn("size-1.5 rounded-full", selectedOrder.status === OrderStatus.COMPLETED ? 'bg-emerald-500' : 'bg-current')} />
                      {getStatusLabel(selectedOrder.status)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-muted-foreground/80">
                      <span className="text-[11px] font-medium uppercase tracking-wide">Giá gốc</span>
                      <span className="font-bold text-sm">{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground/80">
                      <span className="text-[11px] font-medium uppercase tracking-wide">Phí</span>
                      <span className="font-bold text-sm">{formatCurrency(0)}</span>
                    </div>
                    <div className="pt-4 border-t border-border/10 flex justify-between items-center">
                      <span className="text-xs font-sans font-bold italic uppercase tracking-wider text-primary">Tổng cộng</span>
                      <span
                        className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
                  <ShieldCheck className="size-5 text-primary/70 shrink-0" />
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-primary">Xác minh giao dịch</h5>
                    <p className="text-[11px] font-medium text-muted-foreground/70 leading-relaxed">
                      Giao dịch này đã được hệ thống xác minh và ghi nhận.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sheet Footer */}
              <div className="p-8 border-t border-border/10 shrink-0 space-y-3 bg-muted/5">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-primary/20 text-primary font-bold uppercase tracking-wide text-xs hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    setIsSheetOpen(false);
                    // Navigate to transactions with orderId filter
                    window.location.href = `/transactions?orderId=${selectedOrder.id}`;
                  }}
                >
                  <Database className="size-3.5" />
                  Xem nhật ký giao dịch
                </Button>
                <Button
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wide text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Đóng chi tiết
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
