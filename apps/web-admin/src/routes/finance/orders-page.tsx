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
  CreditCard, RotateCcw, ShieldCheck, TrendingUp, Activity, Search, User
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
import { PageHeader } from '@/components/common/page-header';

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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tài chính & Doanh thu"
        subtitle="Theo dõi dòng tiền và tối ưu hiệu suất Torii Academy"
        stats={[
          { label: "Tổng số Giao dịch", value: total.toLocaleString() }
        ]}
        actions={
          <Button
            onClick={loadPayments}
            disabled={isLoading}
          >
            <RotateCcw className={cn("mr-2 size-4", isLoading && "animate-spin")} />
            Làm mới
          </Button>
        }
      />


      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tổng doanh thu', value: '25.4M', sub: '+12% so với tháng trước', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Trạng thái Hệ thống', value: 'Ổn định', sub: 'Độ trễ < 12ms', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Bảo mật', value: 'Hoạt động', sub: '99.9% Tỷ lệ an toàn', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
        ].map((stat, i) => (
          <div key={i}
            className="group p-6 rounded-xl border bg-card hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                <stat.icon className="size-4" />
              </div>
              <div className="size-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{stat.label}</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-medium text-muted-foreground/40">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
            <Input
              placeholder="Tìm kiếm giao dịch (Mã đơn, Người dùng...)"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.values(OrderStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {getStatusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">#</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead className="text-center">Số tiền</TableHead>
                <TableHead className="text-center">Phương thức</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Ngày tạo</TableHead>
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
                payments.map((payment, index) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(payment);
                      setIsSheetOpen(true);
                    }}
                  >
                    <TableCell className="text-center text-xs font-medium text-muted-foreground/60 tabular-nums">
                      {(page - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground truncate max-w-[200px]">
                          {payment.userId}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">Mã: {payment.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold tabular-nums">
                        {formatCurrency(payment.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider">
                        <Zap className="size-3 mr-1 opacity-50" />
                        {payment.paymentMethod}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusColor(payment.status))}>
                        <div className={cn("size-1 rounded-full mr-1.5", payment.status === OrderStatus.COMPLETED ? 'bg-emerald-500' : 'bg-current opacity-50')} />
                        {getStatusLabel(payment.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-xs">
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
          className="sm:max-w-xl p-0 border-l border-border/40 bg-card/95 backdrop-blur-3xl rounded-l-2xl shadow-2xl">
          {selectedOrder && (
            <div className="h-full flex flex-col font-sans">
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
                  <h2 className="text-2xl font-bold text-foreground leading-none tracking-tight">Chi tiết Đơn hàng</h2>
                </div>
              </div>

              {/* Sheet Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {/* Main Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-black">
                      <User className="size-3.5" />
                      Người dùng
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{selectedOrder.userId}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-black">
                      <Database className="size-3.5" />
                      Phương thức
                    </div>
                    <p className="text-sm font-bold text-foreground uppercase tracking-wide">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-black">
                      <Globe className="size-3.5" />
                      Nền tảng
                    </div>
                    <p className="text-sm font-bold text-foreground">Torii Academy Web</p>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-black">
                      <CalendarDays className="size-3.5" />
                      Ngày tạo
                    </div>
                    <p className="text-sm font-bold text-foreground">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                {/* Financial Stats */}
                <div className="p-6 rounded-2xl bg-muted/20 border border-border/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/10 pb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Loại giao dịch</p>
                      <h4 className="text-sm font-bold text-foreground">Đăng ký khóa học</h4>
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
                      <span className="text-[11px] font-bold uppercase tracking-wide">Giá gốc</span>
                      <span className="font-black text-sm">{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground/80">
                      <span className="text-[11px] font-bold uppercase tracking-wide">Phí</span>
                      <span className="font-black text-sm">{formatCurrency(0)}</span>
                    </div>
                    <div className="pt-4 border-t border-border/10 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-primary">Tổng cộng</span>
                      <span
                        className="text-2xl font-black text-foreground tracking-tight">{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
                  <ShieldCheck className="size-5 text-primary/70 shrink-0" />
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-primary">Xác minh giao dịch</h5>
                    <p className="text-[11px] font-bold text-muted-foreground/70 leading-relaxed">
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
                  }}
                >
                  <Database className="size-3.5" />
                  Xem nhật ký giao dịch
                </Button>
                <Button
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
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
