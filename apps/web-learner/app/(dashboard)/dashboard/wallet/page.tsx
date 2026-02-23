'use client'

import React, { useState } from 'react'
import {
    Wallet,
    Zap,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Coins,
    History,
    ChevronLeft,
    ChevronRight,
    Trophy,
    ShoppingBag,
    Gift,
    Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'
import { useBalanceHistory, orderApi } from '@/lib/api/services/order-api'
import { useGamificationHistory } from '@/lib/api/services/gamification-api'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAppSelector } from '@/hooks/hooks'
import { formatNumber, formatCurrency, formatDateTime } from '@/utils/format-utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { toast } from '@workspace/ui/components/sonner'
import { OrderType, PaymentMethod } from '@workspace/schemas'

export default function WalletPage() {
    const { user } = useAppSelector((state) => state.auth)
    const [balancePage, setBalancePage] = useState(1)
    const [pointsPage, setPointsPage] = useState(1)
    const [isTopUpOpen, setIsTopUpOpen] = useState(false)
    const [topUpAmount, setTopUpAmount] = useState('50000')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const status = searchParams.get('status')
        if (status === 'success') {
            toast.success('Nạp tiền thành công! Số dư sẽ được cập nhật trong giây lát.')
            router.replace('/dashboard/wallet')
        } else if (status === 'cancel') {
            toast.error('Giao dịch đã bị hủy.')
            router.replace('/dashboard/wallet')
        }
    }, [searchParams, router])

    const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalanceHistory } = useBalanceHistory({ page: balancePage, limit: 10 })
    const { data: pointsData, isLoading: pointsLoading } = useGamificationHistory({ page: pointsPage, limit: 10 })

    const handleTopUp = async () => {
        const amount = parseInt(topUpAmount, 10)
        if (isNaN(amount) || amount < 10000) {
            toast.error('Số tiền nạp tối thiểu là 10.000đ')
            return
        }

        try {
            setIsSubmitting(true)
            const order = await orderApi.createOrder({
                amount: amount,
                orderType: OrderType.TOP_UP,
                paymentMethod: PaymentMethod.PAYOS,
                description: `Nạp ${formatNumber(amount)} Coins vào ví Torii`,
                metadata: {
                    returnUrl: window.location.origin + '/dashboard/wallet?status=success',
                    cancelUrl: window.location.origin + '/dashboard/wallet?status=cancel',
                }
            })

            if (order.metadata?.checkoutUrl) {
                window.location.href = order.metadata.checkoutUrl
            } else {
                toast.success('Đơn hàng đã được tạo. Vui lòng kiểm tra lịch sử thanh toán.')
                setIsTopUpOpen(false)
            }
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi tạo đơn hàng nạp tiền')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-5xl animate-in fade-in duration-500">
            {/* Wallet Header Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 rounded-[2rem]">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                                <Coins className="w-8 h-8" />
                            </div>
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1">
                                Ví Torii
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white/70 text-sm font-medium tracking-wide uppercase">Số dư khả dụng</p>
                            <h2 className="text-5xl font-black tabular-nums">
                                {formatNumber((user as any)?.balance) || 0} <span className="text-2xl font-bold opacity-80 ml-1">Coins</span>
                            </h2>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <Button
                                variant="secondary"
                                className="px-6"
                                onClick={() => setIsTopUpOpen(true)}
                            >
                                <Zap className="w-4 h-4 mr-2" /> Nạp thêm
                            </Button>
                        </div>
                    </CardContent>
                    {/* Decorative element */}
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                </Card>

                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-purple-500/20 rounded-[2rem]">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1">
                                Điểm tích lũy
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white/70 text-sm font-medium tracking-wide uppercase">Tổng điểm thưởng</p>
                            <h2 className="text-5xl font-black tabular-nums">
                                {formatNumber(user?.xp) || 0} <span className="text-2xl font-bold opacity-80 ml-1">Points</span>
                            </h2>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <Button variant="secondary" className="px-6">
                                <Gift className="w-4 h-4 mr-2" /> Đổi quà
                            </Button>
                        </div>
                    </CardContent>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                </Card>
            </div>

            {/* History Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Lịch sử giao dịch</h2>
                </div>

                <Tabs defaultValue="coins" className="w-full">
                    <TabsList className="bg-muted/50 p-1 rounded-2xl mb-6">
                        <TabsTrigger value="coins" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                            Số dư Coin
                        </TabsTrigger>
                        <TabsTrigger value="points" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                            Điểm thưởng (XP)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="coins" className="space-y-4">
                        <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-0">
                                {balanceLoading ? (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                                        <p className="text-muted-foreground text-sm font-medium">Đang tải lịch sử...</p>
                                    </div>
                                ) : (balanceData?.data?.length ?? 0) > 0 ? (
                                    <div className="divide-y divide-border/10">
                                        {balanceData?.data?.map((tx: any) => (
                                            <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                                        tx.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                                    )}>
                                                        {tx.amount > 0 ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-foreground leading-tight">{tx.description || 'Giao dịch ví'}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {formatDateTime(tx.createdAt, "HH:mm, dd MMM yyyy")}
                                                            <Badge variant="outline" className="ml-2 py-0 h-4 text-[9px] uppercase font-black tracking-tighter opacity-70">
                                                                {tx.type}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={cn(
                                                        "text-lg font-black tabular-nums tracking-tight",
                                                        tx.amount > 0 ? "text-emerald-500" : "text-foreground"
                                                    )}>
                                                        {tx.amount > 0 ? '+' : ''}{formatNumber(tx.amount)}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Coins</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground font-medium">Bạn chưa có giao dịch nào</p>
                                            <p className="text-xs text-muted-foreground/60">Các biến động số dư sẽ được cập nhật tại đây</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        {(balanceData?.totalPages ?? 0) > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <Button
                                    variant="outline" size="sm"
                                    disabled={balancePage === 1}
                                    onClick={() => setBalancePage(p => p - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    disabled={balancePage === (balanceData?.totalPages ?? 0)}
                                    onClick={() => setBalancePage(p => p + 1)}
                                >
                                    Sau <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="points" className="space-y-4">
                        <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-0">
                                {pointsLoading ? (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                                        <p className="text-muted-foreground text-sm font-medium">Đang tải lịch sử...</p>
                                    </div>
                                ) : (pointsData?.data?.length ?? 0) > 0 ? (
                                    <div className="divide-y divide-border/10">
                                        {pointsData?.data?.map((tx: any) => (
                                            <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform",
                                                        tx.amount > 0 ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"
                                                    )}>
                                                        {tx.activityType === 'LESSON_COMPLETE' ? <Award className="w-6 h-6" /> :
                                                            tx.activityType === 'QUIZ_ANSWER' ? <Zap className="w-6 h-6" /> :
                                                                tx.amount > 0 ? <Zap className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-foreground leading-tight">{tx.description || 'Hoạt động thưởng'}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {formatDateTime(tx.createdAt, "HH:mm, dd MMM yyyy")}
                                                            {tx.activityType && (
                                                                <Badge className="ml-2 py-0 h-4 text-[9px] uppercase font-black tracking-tighter bg-primary/10 text-primary border-none">
                                                                    {tx.activityType.replace('_', ' ')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={cn(
                                                        "text-lg font-black tabular-nums tracking-tight",
                                                        tx.amount > 0 ? "text-indigo-500" : "text-purple-500"
                                                    )}>
                                                        {tx.amount > 0 ? '+' : ''}{formatNumber(tx.amount)}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Points</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground font-medium">Chưa có lịch sử điểm</p>
                                            <p className="text-xs text-muted-foreground/60">Hoàn thành bài học để tích điểm ngay!</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        {(pointsData?.totalPages ?? 0) > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <Button
                                    variant="outline" size="sm"
                                    disabled={pointsPage === 1}
                                    onClick={() => setPointsPage(p => p - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    disabled={pointsPage === (pointsData?.totalPages ?? 0)}
                                    onClick={() => setPointsPage(p => p + 1)}
                                >
                                    Sau <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Top Up Dialog */}
            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem] gap-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                                <Coins className="w-5 h-5" />
                            </div>
                            Nạp tiền vào ví
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium pt-2">
                            Nạp Coins để mở khóa các khóa học Premium và dịch vụ hỗ trợ học tập. 1đ = 1 Coin.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-3">
                            <Label htmlFor="amount" className="font-bold text-sm text-foreground/70 uppercase tracking-widest ml-1">Số tiền muốn nạp (VNĐ)</Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground group-focus-within:text-primary transition-colors">đ</div>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    className="pl-10"
                                    placeholder="50,000"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {['20000', '50000', '100000', '200000', '500000', '1000000'].map((amount) => (
                                <Button
                                    key={amount}
                                    variant={topUpAmount === amount ? "default" : "outline"}
                                    onClick={() => setTopUpAmount(amount)}
                                >
                                    {formatCurrency(amount)}
                                </Button>
                            ))}
                        </div>

                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-orange-800/70 font-medium">Bạn sẽ nhận được:</span>
                                <span className="text-orange-800 font-black text-lg">{formatNumber(parseInt(topUpAmount) || 0)} <span className="text-xs uppercase opacity-70">Coins</span></span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-orange-800/50 font-medium">Phương thức:</span>
                                <span className="text-orange-800/70 font-bold uppercase tracking-tighter flex items-center gap-1">
                                    Cổng PayOS (Ngân hàng/QR)
                                </span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            onClick={handleTopUp}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Đang chuyển hướng...
                                </div>
                            ) : (
                                "Xác nhận nạp tiền"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
