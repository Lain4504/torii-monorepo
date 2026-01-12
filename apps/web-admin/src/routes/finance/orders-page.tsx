import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Search, RotateCcw, CreditCard, User } from 'lucide-react';
import { orderApi } from '@/api/services/order-api.ts';
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function OrdersPage() {
  const [payments, setPayments] = useState<OrderResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPayments();
  }, [page]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await orderApi.getAllPayments({
        page,
        limit: 10,
        // userId: search ? search : undefined, // Simple search mock
      });
      setPayments(response.data);
      setTotalPages(response.totalPages);
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
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            Quản lý giao dịch
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Theo dõi lịch sử thanh toán và doanh thu hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPayments} disabled={isLoading}>
            <RotateCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm giao dịch (ID, User...)"
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider w-[100px]">ID</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider">Người dùng</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider">Số tiền</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider">Phương thức</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-center">Trạng thái</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-right">Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy giao dịch nào.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="group hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {payment.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{payment.userId.slice(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-sm">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                      {payment.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-wider ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-medium">
                    {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Trước
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium">
          Trang {page} / {totalPages}
        </div>
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Sau
        </Button>
      </div>
    </div>
  );
}
