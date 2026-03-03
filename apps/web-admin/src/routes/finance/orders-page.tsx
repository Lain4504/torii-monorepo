import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@workspace/ui/components/card';
import { OrdersTable } from '@/components/finance/orders-table';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  RotateCcw, ShieldCheck, TrendingUp, Activity, Search, Calendar as CalendarIcon, Download
} from 'lucide-react';
import { formatDateTime, vi, formatCurrency, formatNumber } from '@/lib/format-utils';
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
import { orderApi } from '@/lib/api/services/order-api';
import { XCircle } from 'lucide-react';
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
import { cn } from "@workspace/ui/lib/utils";
import { toast } from 'sonner';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [status, setStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, startDate, endDate]);

  const { data: ordersResponse, isLoading } = useOrders({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
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

  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return orderApi.cancelOrder(orderId);
    },
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  });

  const handleExportCSV = async () => {
    try {
      toast.info('Đang chuẩn bị dữ liệu xuất CSV...');
      const limit = 1000;
      const res = await orderApi.getAllOrders({
        page: 1,
        limit,
        status: status !== 'all' ? status as OrderStatus : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      } as any);

      if (!res.data?.length) {
        toast.error('Không có dữ liệu để xuất');
        return;
      }

      const headers = ['Mã đơn hàng', 'Khách hàng', 'Email/ID', 'Số tiền', 'Dịch vụ', 'Phương thức', 'Trạng thái', 'Ngày tạo'];
      const rows = res.data.map(order => [
        order.id,
        (order as any).userName || '',
        (order as any).userEmail || order.userId,
        order.amount,
        order.orderType,
        order.paymentMethod,
        getStatusLabel(order.status),
        formatDateTime(order.createdAt)
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `danh-sach-giao-dich-${formatDateTime(new Date(), 'dd-MM-yyyy')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Đã xuất ${res.data.length} giao dịch thành công`);
    } catch (error: any) {
      toast.error('Lỗi khi xuất dữ liệu: ' + (error?.message || 'Lỗi không xác định'));
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
          { label: "Tổng số Giao dịch", value: formatNumber(total) }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={isLoading || orders.length === 0}
            >
              <Download className="mr-2 size-4" />
              Xuất CSV Tổng
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isLoading}
            >
              <RotateCcw className={cn("mr-2 size-4", isLoading && "animate-spin")} />
              Làm mới Dữ liệu
            </Button>
          </div>
        }
      />


      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Tổng doanh thu',
            value: stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '0 ₫',
            sub: 'Dựa trên bộ lọc hiện tại',
            icon: TrendingUp,
            color: 'text-primary',
            bg: 'bg-primary/10'
          },
          {
            label: 'Số đơn hoàn thành',
            value: formatNumber(stats?.orderCount) || '0',
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
          onCancel={(order) => {
            if (confirm(`Bạn có chắc muốn hủy đơn hàng ${order.id.slice(0, 8)}...?`)) {
              cancelMutation.mutate(order.id);
            }
          }}
          onExport={(order) => {
            // Reusing total export logic but for single one
            const headers = ['Mã đơn hàng', 'Khách hàng', 'Email/ID', 'Số tiền', 'Dịch vụ', 'Phương thức', 'Trạng thái', 'Ngày tạo'];
            const rows = [[
              order.id,
              (order as any).userName || '',
              (order as any).userEmail || order.userId,
              order.amount,
              order.orderType,
              order.paymentMethod,
              getStatusLabel(order.status),
              formatDateTime(order.createdAt)
            ]];
            const csvContent =
              "data:text/csv;charset=utf-8,\uFEFF" +
              [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
              ].join('\n');

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `hoa-don-${order.id.slice(0, 8)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Đã xuất hóa đơn ${order.id.slice(0, 8)}...`);
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
