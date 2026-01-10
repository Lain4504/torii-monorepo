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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-3">
                        <Receipt className="w-8 h-8 text-primary" />
                        Lịch sử thanh toán
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground/80 tracking-wide">
                        Theo dõi và quản lý các giao dịch học tập
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Tìm mã giao dịch..."
                            className="pl-10 h-10 w-full md:w-64 bg-background/50 border-border/40 focus:bg-background focus:border-primary/20 rounded-xl transition-all font-medium text-xs placeholder:text-muted-foreground/50 shadow-sm"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10 border-border/40 rounded-xl hover:bg-muted/50 cursor-pointer text-muted-foreground">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-[1.5rem] border border-border/40 bg-background/40 backdrop-blur-xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/30 border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest text-muted-foreground py-5">Mã Giao Dịch</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-5">Khóa Học / Nội Dung</TableHead>
                            <TableHead className="w-[140px] text-[10px] font-black uppercase tracking-widest text-muted-foreground py-5">Ngày</TableHead>
                            <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-muted-foreground py-5 text-right">Số Tiền</TableHead>
                            <TableHead className="w-[150px] text-[10px] font-black uppercase tracking-widest text-muted-foreground py-5 text-center">Trạng Thái</TableHead>
                            <TableHead className="w-[50px] py-5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id} className="group hover:bg-primary/[0.02] border-white/5 transition-colors">
                                <TableCell className="font-bold text-xs text-muted-foreground/80 py-4">
                                    <span className="font-mono text-primary/80">{payment.id}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{payment.course}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mt-0.5">{payment.method}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 text-xs font-semibold text-muted-foreground">
                                    {new Date(payment.date).toLocaleDateString('vi-VN')}
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <span className="font-black text-sm text-foreground">
                                        {payment.amount.toLocaleString('vi-VN')}₫
                                    </span>
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                    <div className="flex justify-center">
                                        {getStatusBadge(payment.status)}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 text-right pr-4">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
