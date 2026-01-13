'use client'

import { Badge } from '@workspace/ui/components/badge'
import {
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Filter,
    Download,
    Receipt,
    ExternalLink
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { cn } from '@workspace/ui/lib/utils'

export default function PaymentHistoryPage() {
    const payments = [
        {
            id: 'TXN-10293',
            course: 'Tiếng Nhật N5 - Khóa học toàn diện',
            date: '2026-01-05',
            amount: 499000,
            method: 'Chuyển khoản ngân hàng',
            status: 'completed',
        },
        {
            id: 'TXN-10182',
            course: 'Ngữ pháp N4 nâng cao',
            date: '2025-12-20',
            amount: 599000,
            method: 'Chuyển khoản ngân hàng',
            status: 'completed',
        },
        {
            id: 'TXN-09823',
            course: 'Học Kanji qua hình ảnh',
            date: '2025-11-15',
            amount: 350000,
            method: 'Chuyển khoản ngân hàng',
            status: 'completed',
        },
        {
            id: 'TXN-09712',
            course: 'Giao tiếp tiếng Nhật cơ bản',
            date: '2025-11-01',
            amount: 450000,
            method: 'Chuyển khoản ngân hàng',
            status: 'failed',
        },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-bold text-[10px] uppercase tracking-wider gap-1.5 py-1">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-600 font-bold text-[10px] uppercase tracking-wider gap-1.5 py-1">
                        <Clock className="w-3 h-3" /> Chờ xử lý
                    </Badge>
                )
            case 'failed':
                return (
                    <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-600 font-bold text-[10px] uppercase tracking-wider gap-1.5 py-1">
                        <XCircle className="w-3 h-3" /> Thất bại
                    </Badge>
                )
            default:
                return null
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Simplified Header */}
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
                            placeholder="Mã giao dịch..."
                            className="pl-9 h-9 w-full md:w-56 bg-muted/5 border-border/10 rounded-lg text-xs placeholder:text-muted-foreground/40 focus:ring-1 ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Simplified Table Content */}
            <div className="space-y-4">
                <div className="hidden md:grid grid-cols-6 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-2">Khóa học</div>
                    <div className="col-span-1">Ngày</div>
                    <div className="col-span-1 text-right">Số tiền</div>
                    <div className="col-span-1 text-center">Trạng thái</div>
                </div>
                <div className="divide-y divide-border/5 border-y border-border/10">
                    {payments.map((p) => (
                        <div key={p.id} className="grid grid-cols-1 md:grid-cols-6 items-center p-4 hover:bg-muted/5 transition-colors group">
                            <div className="col-span-1 text-xs font-mono text-primary/60 mb-2 md:mb-0">#{p.id.split('-')[1]}</div>
                            <div className="col-span-2">
                                <p className="text-sm font-bold text-foreground truncate">{p.course}</p>
                                <p className="text-[10px] text-muted-foreground/40 font-medium uppercase">{p.method}</p>
                            </div>
                            <div className="col-span-1 text-xs text-muted-foreground font-medium md:table-cell hidden">
                                {new Date(p.date).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="col-span-1 text-right text-sm font-bold text-foreground">
                                {p.amount.toLocaleString('vi-VN')}₫
                            </div>
                            <div className="col-span-1 flex justify-center mt-3 md:mt-0">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                    p.status === 'completed' ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" : "bg-red-500/5 text-red-600 border-red-500/10"
                                )}>
                                    {p.status === 'completed' ? 'Thành công' : 'Thất bại'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination / Load More */}
            <div className="flex justify-center pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-primary cursor-pointer transition-colors">
                    Hiển thị 4 trong tổng số 12 giao dịch
                </p>
            </div>
        </div>
    )
}
