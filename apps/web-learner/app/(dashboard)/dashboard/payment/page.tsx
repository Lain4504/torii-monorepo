'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import {
    CreditCard,
    ArrowLeft,
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Filter
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'

export default function PaymentHistoryPage() {
    // Mock payment history data
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
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] uppercase px-2 py-0.5">
                        Thành công
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-none font-bold text-[10px] uppercase px-2 py-0.5">
                        Chờ xử lý
                    </Badge>
                )
            case 'failed':
                return (
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-none font-bold text-[10px] uppercase px-2 py-0.5">
                        Thất bại
                    </Badge>
                )
            default:
                return null
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            case 'pending':
                return <Clock className="w-4 h-4 text-amber-500" />
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />
            default:
                return null
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Lịch sử thanh toán</h1>
                    <p className="text-sm text-muted-foreground">Quản lý các giao dịch và hóa đơn của bạn</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Tìm mã giao dịch..."
                            className="pl-9 h-10 w-full md:w-64 bg-muted/20 border-border/50 focus:bg-background transition-all"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10 border-border/50 cursor-pointer">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                {payments.map((payment) => (
                    <Card key={payment.id} className="border-border/50 shadow-none bg-card/30 hover:bg-card/50 transition-colors group overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${payment.status === 'completed' ? 'bg-emerald-500/5' : payment.status === 'failed' ? 'bg-red-500/5' : 'bg-amber-500/5'}`}>
                                        <CreditCard className={`w-5 h-5 ${payment.status === 'completed' ? 'text-emerald-500' : payment.status === 'failed' ? 'text-red-500' : 'text-amber-500'}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-foreground line-clamp-1">{payment.course}</h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{payment.id}</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(payment.date).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-border/30 pt-4 md:pt-0">
                                    <div className="text-right space-y-1">
                                        <p className="text-sm font-bold text-foreground">
                                            {payment.amount.toLocaleString('vi-VN')}₫
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{payment.method}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end gap-1.5">
                                            {getStatusBadge(payment.status)}
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-bold uppercase">
                                                {getStatusIcon(payment.status)}
                                                <span>{payment.status === 'completed' ? 'Giao dịch hoàn tất' : payment.status === 'failed' ? 'Giao dịch lỗi' : 'Đang xử lý'}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/5 hover:text-primary transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination / Load More */}
            <div className="flex justify-center pt-4">
                <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Xem các giao dịch cũ hơn
                </Button>
            </div>
        </div>
    )
}
