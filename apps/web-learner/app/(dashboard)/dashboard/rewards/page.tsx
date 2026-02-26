'use client'

import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@workspace/ui/components/empty'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Gift, Star, Ticket, ArrowRight, CheckCircle2, AlertCircle, TrendingUp, Snowflake } from 'lucide-react'
import { useGamificationProfile, useRewards, useRedeemPoints } from '@/lib/api/services/gamification-api'
import { useMyCoupons } from '@/lib/api/services/coupon-api'
import { toast } from 'sonner'
import { Button } from '@workspace/ui/components/button'
import { formatDate, formatCurrency, formatNumber } from '@/utils/format-utils'
import { useState } from 'react'
import { cn } from "@workspace/ui/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import Link from 'next/link'

export default function RewardsPage() {
    const { data: profile, isLoading: profileLoading } = useGamificationProfile()
    const { data: rewards, isLoading: rewardsLoading } = useRewards()
    const { data: coupons } = useMyCoupons(!!profile)
    const redeemMutation = useRedeemPoints()

    const [selectedDeal, setSelectedDeal] = useState<any>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [redeemedCoupon, setRedeemedCoupon] = useState<any>(null)

    if (profileLoading || rewardsLoading) {
        return <PageLoading text="Đang tải cửa hàng quà tặng..." />
    }

    const handleRedeemClick = (deal: any) => {
        if ((profile?.points || 0) < deal.points) {
            toast.error('Bạn không đủ điểm để đổi quà này')
            return
        }
        setSelectedDeal(deal)
        setIsConfirmOpen(true)
    }

    const handleConfirmRedeem = async () => {
        if (!selectedDeal) return

        try {
            const result = await redeemMutation.mutateAsync(selectedDeal.id)
            if (result.isInternal) {
                setRedeemedCoupon(null)
                toast.success(result.message || 'Đổi quà thành công!')
            } else {
                setRedeemedCoupon(result.coupon)
                toast.success('Đã nhận được mã giảm giá!')
            }
            setIsConfirmOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Đã có lỗi xảy ra')
        }
    }

    return (
        <div className="container mx-auto space-y-10 max-w-5xl animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Cửa hàng quà tặng</h1>
                    <p className="text-muted-foreground mt-2">Dùng điểm tích lũy để đổi lấy các ưu đãi đặc quyền.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-primary/5 border border-primary/10 rounded-xl px-6 py-4 flex items-center gap-4 shadow-sm">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Star className="size-6 text-primary fill-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Điểm hiện có</p>
                            <p className="text-2xl font-black text-primary">{formatNumber(profile?.points) || 0} Points</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewards?.map((reward) => {
                    const isStreakFreeze = reward.name.toLowerCase().includes('streak freeze') ||
                        reward.name.toLowerCase().includes('bùa bảo vệ chuỗi');

                    return (
                        <Card key={reward.id} className={cn(
                            "relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50",
                            isStreakFreeze && "hover:border-blue-500/50"
                        )}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                {isStreakFreeze ? <Snowflake className="size-16" /> : <Gift className="size-16" />}
                            </div>

                            <CardHeader>
                                <div className={cn(
                                    "size-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                                    isStreakFreeze ? "bg-blue-500/10" : "bg-primary/10"
                                )}>
                                    {isStreakFreeze ? (
                                        <Snowflake className="size-5 text-blue-500" />
                                    ) : (
                                        reward.discountType === 'percentage' ? <TrendingUp className="size-5 text-primary" /> : <Ticket className="size-5 text-primary" />
                                    )}
                                </div>
                                <CardTitle className="text-xl">{reward.name}</CardTitle>
                                <CardDescription>{reward.description}</CardDescription>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {reward.minOrderAmount ? (
                                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto font-normal">
                                            Đơn tối thiểu: {formatCurrency(reward.minOrderAmount)}
                                        </Badge>
                                    ) : isStreakFreeze ? (
                                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto font-normal bg-blue-50 text-blue-600 border-none">
                                            Vật phẩm bảo vệ
                                        </Badge>
                                    ) : null}
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Star className="size-4 fill-primary" />
                                    <span>{formatNumber(reward.points)} Points</span>
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={(profile?.points || 0) >= reward.points ? (isStreakFreeze ? "outline" : "default") : "outline"}
                                    disabled={(profile?.points || 0) < reward.points || redeemMutation.isPending}
                                    onClick={() => handleRedeemClick(reward)}
                                >
                                    {(profile?.points || 0) >= reward.points ? 'Đổi ngay' : 'Chưa đủ điểm'}
                                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* My Coupons Section */}
            <div className="pt-10 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <Ticket className="size-5 text-primary" />
                        Mã giảm giá của tôi
                    </h2>
                </div>

                {coupons && coupons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coupons.map((coupon: any) => (
                            <Card key={coupon.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="size-6 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-primary tracking-widest truncate">{coupon.code}</h3>
                                            {!coupon.userId && <Badge variant="secondary" className="text-[10px]">Công khai</Badge>}
                                        </div>
                                        <p className="text-sm font-medium text-foreground truncate">{coupon.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Hạn dùng: {formatDate(coupon.validUntil)}
                                            {coupon.maxDiscountAmount && ` • Giảm tối đa ${formatCurrency(coupon.maxDiscountAmount)}`}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => {
                                    navigator.clipboard.writeText(coupon.code)
                                    toast.success('Đã sao chép mã!')
                                }}>
                                    Sao chép
                                </Button>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Empty className="py-12 border-2 border-dashed bg-muted/5">
                        <EmptyMedia variant="icon" className="bg-muted/20">
                            <Ticket className="size-8 text-muted-foreground/30" />
                        </EmptyMedia>
                        <EmptyContent>
                            <EmptyTitle>Bạn chưa có mã giảm giá</EmptyTitle>
                            <EmptyDescription>
                                Các mã giảm giá bạn đã đổi từ điểm thưởng sẽ xuất hiện tại đây.
                                <br />Hãy tích lũy điểm và bắt đầu mua sắm nhé!
                            </EmptyDescription>
                        </EmptyContent>
                    </Empty>
                )}
            </div>

            {/* Confirm Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận đổi điểm</DialogTitle>
                        <DialogDescription>
                            Bạn muốn dùng <span className="font-bold text-primary">{selectedDeal?.points} Points</span> để đổi lấy <span className="font-bold">"{selectedDeal?.name}"</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 flex items-center gap-4 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <AlertCircle className="size-5 shrink-0" />
                        <p className="text-xs font-medium">Mã giảm giá sau khi đổi sẽ được gán cho tài khoản của bạn và không thể chuyển nhượng.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} disabled={redeemMutation.isPending}>Hủy</Button>
                        <Button onClick={handleConfirmRedeem} disabled={redeemMutation.isPending}>
                            {redeemMutation.isPending ? 'Đang lý...' : 'Xác nhận đổi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={!!redeemedCoupon} onOpenChange={(open) => !open && setRedeemedCoupon(null)}>
                <DialogContent className="sm:max-w-[425px] text-center">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center">🎉 Đổi quà thành công!</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Bạn đã đổi thành công <span className="font-bold text-primary">{selectedDeal?.points} Points</span> lấy ưu đãi này.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-4">
                        <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Ticket className="size-24 text-primary" />
                            </div>

                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Mã giảm giá của bạn</p>
                            <h3 className="text-4xl font-black text-primary tracking-[0.3em] mb-4 select-all">{redeemedCoupon?.code}</h3>

                            <Button
                                variant="outline"
                                size="sm"
                                className="font-bold uppercase tracking-widest text-[10px] h-8 border-2"
                                onClick={() => {
                                    navigator.clipboard.writeText(redeemedCoupon?.code)
                                    toast.success('Đã sao chép mã!')
                                }}
                            >
                                Sao chép mã
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground font-medium">
                            Mã này đã được lưu vào <Link href="/dashboard/wallet" className="text-primary hover:underline font-bold">Ví của bạn</Link>.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="w-full font-bold uppercase tracking-widest" onClick={() => setRedeemedCoupon(null)}>
                            Tuyệt vời!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
