import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { OrdersTable } from '@/components/finance/orders-table';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import { Calendar } from '@workspace/ui/components/calendar';
import { SmartPagination } from '@/components/common/smart-pagination';
import { PageHeader } from '@/components/common/page-header';
import { OrderDetailSheet } from '@/components/finance/order-detail-sheet';
import { ExportOrdersDialog } from '@/components/finance/export-orders-dialog';
import { useOrders, useOrderStats } from '@/lib/api/services/finance';
import { orderApi } from '@/lib/api/services/order-api';
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
import { formatDateTime, vi, formatCurrency, formatNumber } from '@/lib/format-utils';
import { cn } from "@workspace/ui/lib/utils";
import { toast } from 'sonner';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { useBoolean } from '@workspace/ui/hooks/use-boolean';
import { Search, Download, CalendarIcon, Filter, RotateCcw } from 'lucide-react';

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PAID: return 'Hoàn thành';
    case OrderStatus.PENDING:
    case OrderStatus.PROCESSING: return 'Đang xử lý';
    case OrderStatus.FAILED: return 'Thất bại';
    case OrderStatus.CANCELLED: return 'Đã hủy';
    case OrderStatus.REFUNDED: return 'Hoàn tiền';
    default: return status;
  }
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [status, setStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isExportDialogOpen = useBoolean();

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
    mutationFn: async (orderId: string) => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể hủy đơn hàng');
    },
  });

  const hasDateFilter = startDate || endDate;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Quản lý Tài chính"
        subtitle="Theo dõi doanh thu và trạng thái các giao dịch trong hệ thống"
        stats={[
          { label: 'Tổng giao dịch', value: formatNumber(total) },
          { label: 'Doanh thu', value: stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '0 ₫' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => queryClient.invalidateQueries()}
              disabled={isLoading}
            >
              <RotateCcw className={cn("size-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              onClick={isExportDialogOpen.setTrue}
              disabled={isLoading || orders.length === 0}
            >
              <Download />
              Xuất báo cáo
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn, email hoặc tên khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "gap-2",
                    hasDateFilter && "border-primary text-primary"
                  )}
                >
                  <CalendarIcon className="size-4" />
                  {hasDateFilter
                    ? `${startDate ? formatDateTime(startDate, 'dd/MM') : '?'} – ${endDate ? formatDateTime(endDate, 'dd/MM') : '?'}`
                    : 'Lọc theo ngày'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Từ ngày</p>
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={(date) => setStartDate(date ? formatDateTime(date, "yyyy-MM-dd") : '')}
                        locale={vi}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Đến ngày</p>
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={(date) => setEndDate(date ? formatDateTime(date, "yyyy-MM-dd") : '')}
                        locale={vi}
                      />
                    </div>
                  </div>
                  {hasDateFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => { setStartDate(''); setEndDate(''); }}
                    >
                      <RotateCcw className="size-4" />
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Table */}

        <div className="rounded-md bg-background border overflow-hidden">
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
              // Client-side export for single item
              const headers = ['Mã đơn hàng', 'Khách hàng', 'Email/ID', 'Số tiền', 'Dịch vụ', 'Phương thức', 'Trạng thái', 'Ngày tạo'];
              const rows = [[
                order.id,
                (order as any).userName || '',
                (order as any).userEmail || order.userId,
                order.amount,
                order.orderType,
                order.paymentMethod,
                getStatusLabel(order.status),
                formatDateTime(order.createdAt),
              ]];
              const csvContent = "data:text/csv;charset=utf-8,\uFEFF" +
                [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
              const link = document.createElement("a");
              link.setAttribute("href", encodeURI(csvContent));
              link.setAttribute("download", `hoa-don-${order.id.slice(0, 8)}.csv`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              toast.success(`Đã xuất hóa đơn ${order.id.slice(0, 8)}...`);
            }}
            page={page}
            limit={10}
          />
        </div>

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

      <ExportOrdersDialog
        open={isExportDialogOpen.value}
        onOpenChange={isExportDialogOpen.setValue}
        filters={{
          status,
          search: debouncedSearch,
          startDate,
          endDate,
        }}
      />
    </div>
  );
}
