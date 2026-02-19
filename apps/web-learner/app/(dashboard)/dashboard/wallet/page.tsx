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
import { useBalanceHistory } from '@/apis/services/order-api'
import { useGamificationHistory } from '@/apis/services/gamification-api'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAppSelector } from '@/hooks/hooks'

export default function WalletPage() {
    const { user } = useAppSelector((state) => state.auth)
    const [balancePage, setBalancePage] = useState(1)
    const [pointsPage, setPointsPage] = useState(1)

    const { data: balanceData, isLoading: balanceLoading } = useBalanceHistory({ page: balancePage, limit: 10 })
    const { data: pointsData, isLoading: pointsLoading } = useGamificationHistory({ page: pointsPage, limit: 10 })

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
                                {(user as any)?.balance?.toLocaleString() || 0} <span className="text-2xl font-bold opacity-80 ml-1">Coins</span>
                            </h2>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl px-6">
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
                                {user?.xp?.toLocaleString() || 0} <span className="text-2xl font-bold opacity-80 ml-1">Points</span>
                            </h2>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <Button className="bg-white text-purple-600 hover:bg-purple-50 font-bold rounded-xl px-6">
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
                                                            {format(new Date(tx.createdAt), "HH:mm, dd MMM yyyy", { locale: vi })}
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
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
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
                                    variant="outline" size="sm" className="rounded-xl"
                                    disabled={balancePage === 1}
                                    onClick={() => setBalancePage(p => p - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                                </Button>
                                <Button
                                    variant="outline" size="sm" className="rounded-xl"
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
                                                            {format(new Date(tx.createdAt), "HH:mm, dd MMM yyyy", { locale: vi })}
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
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
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
                                    variant="outline" size="sm" className="rounded-xl"
                                    disabled={pointsPage === 1}
                                    onClick={() => setPointsPage(p => p - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                                </Button>
                                <Button
                                    variant="outline" size="sm" className="rounded-xl"
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
        </div>
    )
}
