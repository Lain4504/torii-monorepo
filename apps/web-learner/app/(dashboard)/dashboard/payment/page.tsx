'use client';
import { useState } from 'react'
import { Badge } from '@workspace/ui/components/badge'
import {
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Eye,
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
import { cn } from '@workspace/ui/lib/utils'
import { useOrders, useOrder } from '@/apis/services/order-api'
import { ComponentLoading } from '@workspace/ui/components/component-loading'
import { Separator } from '@workspace/ui/components/separator'

export default function PaymentHistoryPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const { data, isLoading } = useOrders({
        search: searchTerm,
        limit: 50
    })

    const { data: orderDetails, isLoading: isLoadingDetails } = useOrder(selectedOrderId || '')

    const payments = data?.data || []

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

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-serif font-bold text-foreground italic">Giao dịch & Thanh toán</h1>
                    <p className="text-xs text-muted-foreground/60 font-medium tracking-wide">
                        Lịch sử ghi danh và các hóa đơn đào tạo của bạn
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                        <Input
                            placeholder="Tìm kiếm giao dịch..."
                            className="pl-9 h-9 w-full md:w-56 bg-muted/5 border-border/10 rounded-lg text-xs placeholder:text-muted-foreground/40 focus:ring-1 ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table Content */}
            {isLoading ? (
                <ComponentLoading className="h-64" />
            ) : (
                <div className="space-y-4">
                    <div className="hidden md:grid grid-cols-7 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        <div className="col-span-1">ID</div>
                        <div className="col-span-2">Nội dung</div>
                        <div className="col-span-1">Ngày</div>
                        <div className="col-span-1 text-right">Số tiền</div>
                        <div className="col-span-1 text-center">Trạng thái</div>
                        <div className="col-span-1 text-right">Thao tác</div>
                    </div>
                    <div className="divide-y divide-border/5 border-y border-border/10">
                        {payments.length > 0 ? payments.map((p) => {
                            const statusInfo = getStatusInfo(p.status)
                            return (
                                <div key={p.id} className="grid grid-cols-1 md:grid-cols-7 items-center p-4 hover:bg-muted/5 transition-colors group">
                                    <div className="col-span-1 text-xs font-mono text-primary/60 mb-2 md:mb-0">#{p.code || p.id.slice(-6).toUpperCase()}</div>
                                    <div className="col-span-2">
                                        <p className="text-sm font-bold text-foreground truncate">{p.description || 'Thanh toán khóa học'}</p>
                                        <p className="text-[10px] text-muted-foreground/40 font-medium uppercase">{p.paymentMethod || 'Gate'}</p>
                                    </div>
                                    <div className="col-span-1 text-xs text-muted-foreground font-medium md:table-cell hidden">
                                        {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="col-span-1 text-right text-sm font-bold text-foreground">
                                        {p.amount.toLocaleString('vi-VN')}₫
                                    </div>
                                    <div className="col-span-1 flex justify-center mt-3 md:mt-0">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                                            statusInfo.color
                                        )}>
                                            {statusInfo.icon}
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-right mt-3 md:mt-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-full"
                                            onClick={() => handleViewDetail(p.id)}
                                        >
                                            <Eye className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="py-20 text-center">
                                <p className="text-sm text-muted-foreground font-medium">Bạn chưa có giao dịch nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Order Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-md rounded-[2rem] p-8 border-border/10">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-serif font-bold italic">Chi tiết giao dịch</DialogTitle>
                        <DialogDescription className="text-xs font-medium tracking-wide uppercase text-muted-foreground/60">
                            Mã đơn hàng: #{orderDetails?.code || selectedOrderId?.slice(-6).toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="py-12 flex justify-center">
                            <ComponentLoading />
                        </div>
                    ) : orderDetails ? (
                        <div className="space-y-8 mt-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-muted/5 p-4 rounded-2xl border border-border/5">
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
                                        <span className="text-muted-foreground/60 font-medium">Khóa học</span>
                                        <span className="font-bold text-right max-w-[200px] leading-tight">{orderDetails.description || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-baseline">
                                        <span className="text-muted-foreground/60 font-medium">Thời gian</span>
                                        <span className="font-mono text-xs">{new Date(orderDetails.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-baseline">
                                        <span className="text-muted-foreground/60 font-medium">Phương thức</span>
                                        <span className="font-bold uppercase tracking-tighter text-xs">{orderDetails.paymentMethod || 'Credit/Debit Card'}</span>
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
        </div>
    )
}
