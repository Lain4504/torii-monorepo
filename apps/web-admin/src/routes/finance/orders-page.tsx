import { useState } from 'react';
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
  CreditCard, RotateCcw, ShieldCheck, TrendingUp, Activity, Search, Calendar as CalendarIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { SmartPagination } from '@/components/common/smart-pagination';
import { PageHeader } from '@/components/common/page-header';
import { OrderDetailSheet } from '@/components/finance/order-detail-sheet';
import { useOrders } from '@/api/services/finance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { MoreHorizontal, Eye, FileText, XCircle } from 'lucide-react';
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
import { formatCurrency } from '@/lib/format-utils';
import { cn } from "@workspace/ui/lib/utils";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: ordersResponse, isLoading } = useOrders({
    page,
    limit: 10,
    status: status !== 'all' ? status as OrderStatus : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const orders = ordersResponse?.data || [];
  const total = ordersResponse?.total || 0;
  const totalPages = ordersResponse?.totalPages || 1;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case OrderStatus.PENDING:
      case OrderStatus.PROCESSING:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case OrderStatus.FAILED:
      case OrderStatus.CANCELLED:
      case OrderStatus.TIMED_OUT:
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
      case OrderStatus.PROCESSING:
        return 'Đang xử lý';
      case OrderStatus.FAILED:
        return 'Thất bại';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      case OrderStatus.TIMED_OUT:
        return 'Hết hạn';
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
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <RotateCcw className={cn("mr-2 size-4", isLoading && "animate-spin")} />
            Làm mới Dữ liệu
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
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Từ:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[160px] h-9 justify-start text-left font-normal text-xs",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {startDate ? format(new Date(startDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(date) => {
                      setStartDate(date ? format(date, "yyyy-MM-dd") : '');
                      setPage(1);
                    }}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Đến:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[160px] h-9 justify-start text-left font-normal text-xs",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {endDate ? format(new Date(endDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={(date) => {
                      setEndDate(date ? format(date, "yyyy-MM-dd") : '');
                      setPage(1);
                    }}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setPage(1);
                  }}
                >
                  <XCircle className="size-4" />
                </Button>
              )}
            </div>
          </div>
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[160px]">
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
                <TableHead>Dữ liệu Đơn hàng</TableHead>
                <TableHead className="text-center font-bold">Số tiền</TableHead>
                <TableHead className="text-center">Dịch vụ</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Ngày ghi nhận</TableHead>
                <TableHead className="w-[80px] text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <RotateCcw className="h-8 w-8 animate-spin text-primary/60" />
                      <p className="text-xs font-sans font-bold italic uppercase tracking-widest text-primary/40">Đang truy xuất dữ liệu Tài chính...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] text-center">
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
                orders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-center text-xs font-medium text-muted-foreground/40 tabular-nums">
                      {(page - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary border border-primary/10">
                          <CreditCard className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm uppercase tracking-tight">
                            {order.id.slice(0, 13)}...
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 font-medium">Khách hàng: {order.userName || order.userEmail || order.userId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-black tabular-nums text-primary">
                        {formatCurrency(order.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 border border-border/50">
                          <Zap className="size-2.5 mr-1" />
                          {order.paymentMethod}
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 mt-1 font-medium">{order.orderType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", getStatusColor(order.status))}>
                        <div className={cn("size-1.5 rounded-full mr-2", order.status === OrderStatus.COMPLETED ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-50')} />
                        {getStatusLabel(order.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-0.5 text-muted-foreground/60">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          <Clock className="size-3 opacity-40" />
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <span className="text-[9px] font-medium opacity-40 uppercase tracking-tighter">Lúc {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-lg">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50 p-1.5 shadow-xl">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 py-1.5">
                            Thao tác Đơn hàng
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsSheetOpen(true);
                            }}
                            className="rounded-lg h-10 px-2 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span className="text-xs font-bold">Xem Chi tiết</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg h-10 px-2 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            <span className="text-xs font-bold">Xuất Hóa đơn</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/50 my-1" />
                          <DropdownMenuItem className="rounded-lg h-10 px-2 text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors cursor-pointer">
                            <XCircle className="mr-2 h-4 w-4" />
                            <span className="text-xs font-bold">Hủy Đơn hàng</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <OrderDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        order={selectedOrder}
      />
    </div>
  );
}
