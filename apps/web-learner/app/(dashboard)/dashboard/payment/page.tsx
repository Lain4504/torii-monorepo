'use client';
import { useState } from 'react'
import { Badge } from '@workspace/ui/components/badge'
import {
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Eye,
    Filter,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@workspace/ui/components/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination"
import { cn } from '@workspace/ui/lib/utils'
import { useOrders, useOrder } from '@/apis/services/order-api'
import { ComponentLoading } from '@workspace/ui/components/component-loading'
import { Separator } from '@workspace/ui/components/separator'
import { OrderStatus } from '@workspace/schemas' // Assuming this exists, or use string literals

export default function PaymentHistoryPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const limit = 10;

    const { data, isLoading } = useOrders({
        limit: limit,
        page: currentPage,
        status: statusFilter === 'all' ? undefined : statusFilter as any
    })

    const { data: orderDetails, isLoading: isLoadingDetails } = useOrder(selectedOrderId || '')

    const orders = data?.data || []
    const meta = {
        totalPages: data?.totalPages || 1,
        currentPage: data?.page || 1,
        totalItems: data?.total || 0,
    }

    const getStatusInfo = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'paid':
                return {
                    label: 'Thành công',
                    color: 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10',
                    icon: <CheckCircle2 className="w-3 h-3" />
                }
            case 'pending':
            case 'processing':
                return {
                    label: 'Chờ xử lý',
                    color: 'bg-amber-500/5 text-amber-600 border-amber-500/10',
                    icon: <Clock className="w-3 h-3" />
                }
            case 'failed':
            case 'cancelled':
                return {
                    label: 'Thất bại',
                    color: 'bg-red-500/5 text-red-600 border-red-500/10',
                    icon: <XCircle className="w-3 h-3" />
                }
            default:
                return {
                    label: status || 'Không xác định',
                    color: 'bg-muted/5 text-muted-foreground border-border/10',
                    icon: null
                }
        }
    }

    const handleViewDetail = (id: string) => {
        setSelectedOrderId(id)
        setIsDetailOpen(true)
    }

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return
        setCurrentPage(page)
    }

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = []
        const totalPages = meta.totalPages
        const current = meta.currentPage

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (current <= 3) {
                pages.push(1, 2, 3, '...', totalPages)
            } else if (current >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, '...', current - 1, current, current + 1, '...', totalPages)
            }
        }
        return pages
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border/30">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-serif font-bold italic uppercase tracking-wide">
                        <Clock className="size-3.5" />
                        Billing
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Lịch sử <span className="text-primary not-italic">Đơn hàng</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Theo dõi các giao dịch và trạng thái thanh toán Torii Learner
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Filter Status */}
                    <div className="w-full sm:w-[180px]">
                        <Select value={statusFilter} onValueChange={(val) => {
                            setStatusFilter(val)
                            setCurrentPage(1) // Reset to page 1 on filter change
                        }}>
                            <SelectTrigger className="h-10 w-full bg-background/40 backdrop-blur-md border-border/40 rounded-xl text-xs font-medium focus:ring-1 ring-primary/20 transition-all shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 text-muted-foreground/40" />
                                    <SelectValue placeholder="Trạng thái" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="completed">Thành công</SelectItem>
                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                <SelectItem value="failed">Thất bại</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 md:flex-initial w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                        <Input
                            placeholder="Tìm kiếm mã đơn, nội dung..."
                            className="pl-9 h-10 w-full md:w-64 bg-background/40 backdrop-blur-md border-border/40 rounded-xl text-xs placeholder:text-muted-foreground/40 focus:ring-1 ring-primary/20 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1) // Reset to page 1 on search
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Table Content */}
            {
                isLoading ? (
                    <ComponentLoading className="h-64" />
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="hidden md:grid grid-cols-7 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                <div className="col-span-1">Mã đơn</div>
                                <div className="col-span-2">Nội dung</div>
                                <div className="col-span-1">Ngày tạo</div>
                                <div className="col-span-1 text-right">Tổng tiền</div>
                                <div className="col-span-1 text-center">Trạng thái</div>
                                <div className="col-span-1 text-right">Thao tác</div>
                            </div>
                            <div className="divide-y divide-border/20 border-y border-border/40 bg-background/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
                                {orders.length > 0 ? orders.map((order) => {
                                    const statusInfo = getStatusInfo(order.status)
                                    return (
                                        <div key={order.id} className="grid grid-cols-1 md:grid-cols-7 items-center p-4 hover:bg-muted/5 transition-colors group">
                                            <div className="col-span-1 text-xs font-mono text-primary/60 mb-2 md:mb-0 flex items-center gap-2">
                                                <span className="md:hidden text-muted-foreground/40 font-bold uppercase text-[10px]">Mã:</span>
                                                #{order.transactionId || order.id.slice(-6).toUpperCase()}
                                            </div>
                                            <div className="col-span-2 mb-2 md:mb-0">
                                                <p className="text-sm font-bold text-foreground truncate">{order.description || 'Thanh toán khóa học'}</p>
                                                <p className="text-[10px] text-muted-foreground/40 font-medium uppercase">{order.paymentMethod || 'Cổng thanh toán'}</p>
                                            </div>
                                            <div className="col-span-1 text-xs text-muted-foreground font-medium md:table-cell hidden">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="col-span-1 text-right flex md:block justify-between items-center mb-2 md:mb-0">
                                                <span className="md:hidden text-muted-foreground/40 font-bold uppercase text-[10px]">Tổng tiền:</span>
                                                <span className="text-sm font-bold text-foreground">
                                                    {order.amount.toLocaleString('vi-VN')}₫
                                                </span>
                                            </div>
                                            <div className="col-span-1 flex justify-center mt-0 md:mt-0 mb-3 md:mb-0">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                                                    statusInfo.color
                                                )}>
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="col-span-1 text-right flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-full"
                                                    onClick={() => handleViewDetail(order.id)}
                                                >
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <div className="py-20 text-center">
                                        <p className="text-sm text-muted-foreground font-medium">Bạn chưa có đơn hàng nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination */}
                        {orders.length > 0 && meta.totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        />
                                    </PaginationItem>

                                    {getPageNumbers().map((page, index) => (
                                        <PaginationItem key={index}>
                                            {page === '...' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    isActive={page === currentPage}
                                                    onClick={() => handlePageChange(page as number)}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )
            }

            {/* Order Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-md rounded-[2rem] p-8 border-border/10">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-serif font-bold italic">Chi tiết đơn hàng</DialogTitle>
                        <DialogDescription className="text-xs font-medium tracking-wide uppercase text-muted-foreground/60">
                            Mã đơn: #{orderDetails?.transactionId || orderDetails?.id.slice(-6).toUpperCase() || selectedOrderId?.slice(-6).toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="py-12 flex justify-center">
                            <ComponentLoading />
                        </div>
                    ) : orderDetails ? (
                        <div className="space-y-8 mt-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-muted/10 p-4 rounded-2xl border border-border/30 shadow-inner">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Trạng thái</span>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        getStatusInfo(orderDetails.status).color
                                    )}>
                                        {getStatusInfo(orderDetails.status).label}
                                    </span>
                                </div>

                                <div className="space-y-3 px-1">
                                    <div className="flex justify-between text-sm items-baseline">
                                        <span className="text-muted-foreground/60 font-medium">Nội dung</span>
                                        <span className="font-bold text-right max-w-[200px] leading-tight">{orderDetails.description || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-baseline">
                                        <span className="text-muted-foreground/60 font-medium">Thời gian</span>
                                        <span className="font-mono text-xs">{new Date(orderDetails.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-baseline">
                                        <span className="text-muted-foreground/60 font-medium">Phương thức</span>
                                        <span className="font-bold uppercase tracking-tighter text-xs">{orderDetails.paymentMethod || 'Thanh toán trực tuyến'}</span>
                                    </div>
                                    <Separator className="bg-border/10 my-4" />
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm font-black uppercase tracking-[0.2em] text-primary">Tổng tiền</span>
                                        <span className="text-2xl font-serif font-black italic">{orderDetails.amount.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
                                onClick={() => setIsDetailOpen(false)}
                            >
                                Đóng
                            </Button>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-red-500 font-medium">
                            Không thể tải chi tiết đơn hàng.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    )
}
