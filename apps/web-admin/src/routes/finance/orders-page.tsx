import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { OrdersTable } from '@/components/finance/orders-table';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  RotateCcw, ShieldCheck, TrendingUp, Activity, Search, Calendar as CalendarIcon
} from 'lucide-react';
import { formatDateTime, vi } from '@/lib/format-utils';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { SmartPagination } from '@/components/common/smart-pagination';
import { PageHeader } from '@/components/common/page-header';
import { OrderDetailSheet } from '@/components/finance/order-detail-sheet';
import { useOrders, useOrderStats } from '@/lib/api/services/finance';
import { XCircle } from 'lucide-react';
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
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
  } as any);

  const { data: statsResponse } = useOrderStats({
    status: status !== 'all' ? status as OrderStatus : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  } as any);

  const orders = ordersResponse?.data || [];
  const total = ordersResponse?.total || 0;
  const totalPages = ordersResponse?.totalPages || 1;
  const stats = statsResponse?.data;


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
      case OrderStatus.REFUNDED:
        return 'Hoàn tiền';
      default:
        return status;
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Quản lý Đơn hàng"
        subtitle="Theo dõi và quản lý tất cả đơn hàng trong hệ thống"
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
          {
            label: 'Tổng doanh thu',
            value: stats?.totalRevenue ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue) : '0 ₫',
            sub: 'Dựa trên bộ lọc hiện tại',
            icon: TrendingUp,
            color: 'text-primary',
            bg: 'bg-primary/10'
          },
          {
            label: 'Số đơn hoàn thành',
            value: stats?.orderCount?.toLocaleString() || '0',
            sub: 'Giao dịch thành công',
            icon: ShieldCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
          },
          {
            label: 'Trạng thái Hệ thống',
            value: 'Ổn định',
            sub: 'Độ trễ < 12ms',
            icon: Activity,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
          }
        ].map((stat, i) => (
          <Card key={i}
            className="group hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
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
                    {startDate ? formatDateTime(startDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(date) => {
                      setStartDate(date ? formatDateTime(date, "yyyy-MM-dd") : '');
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
                    {endDate ? formatDateTime(endDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={(date) => {
                      setEndDate(date ? formatDateTime(date, "yyyy-MM-dd") : '');
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
        <OrdersTable
          data={orders}
          isLoading={isLoading}
          onView={(order) => {
            setSelectedOrder(order);
            setIsSheetOpen(true);
          }}
          page={page}
          limit={10}
        />

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
