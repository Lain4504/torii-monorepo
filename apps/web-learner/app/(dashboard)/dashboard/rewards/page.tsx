'use client'

import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@workspace/ui/components/empty'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Gift, Star, Ticket, ArrowRight, CheckCircle2, TrendingUp, Snowflake } from 'lucide-react'
import { useGamificationProfile, useRewards, useRedeemPoints } from '@/lib/api/services/gamification-api'
import { useMyCoupons } from '@/lib/api/services/coupon-api'
import { toast } from 'sonner'
import { Button } from '@workspace/ui/components/button'
import { formatDate, formatCurrency, formatNumber } from '@/utils/format-utils'
import { useState } from 'react'
import { cn } from "@workspace/ui/lib/utils"
import Link from 'next/link'
import { RedeemConfirmDialog } from '@/components/rewards/redeem-confirm-dialog'
import { RedeemSuccessDialog } from '@/components/rewards/redeem-success-dialog'

export default function RewardsPage() {
    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGamificationProfile()
    const { data: rewards, isLoading: rewardsLoading } = useRewards()
    const { data: coupons, refetch: refetchCoupons } = useMyCoupons(!!profile)
    const redeemMutation = useRedeemPoints()

    const [selectedDeal, setSelectedDeal] = useState<any>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [redeemedCoupon, setRedeemedCoupon] = useState<any>(null)

    if (profileLoading || rewardsLoading) {
        return <PageLoading />
    }

    const handleRedeemClick = (deal: any) => {
        if ((profile?.points || 0) < deal.costPoints) {
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

            // Manually refetch profile and coupons to ensure UI updates immediately
            await Promise.all([
                refetchProfile(),
                refetchCoupons()
            ])

            setRedeemedCoupon({
                code: result.couponCode,
                pointsDeducted: selectedDeal.costPoints
            })
            toast.success('Đã nhận được mã giảm giá!')
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
                                        reward.config?.discountType === 'PERCENTAGE' ? <TrendingUp className="size-5 text-primary" /> : <Ticket className="size-5 text-primary" />
                                    )}
                                </div>
                                <CardTitle className="text-xl">{reward.name}</CardTitle>
                                <CardDescription>{reward.description}</CardDescription>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {reward.config?.minOrderValue ? (
                                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto font-normal">
                                            Đơn tối thiểu: {formatCurrency(reward.config.minOrderValue)}
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
                                    <span>{formatNumber(reward.costPoints)} Points</span>
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={(profile?.points || 0) >= reward.costPoints ? (isStreakFreeze ? "outline" : "default") : "outline"}
                                    disabled={(profile?.points || 0) < reward.costPoints || redeemMutation.isPending}
                                    onClick={() => handleRedeemClick(reward)}
                                >
                                    {(profile?.points || 0) >= reward.costPoints ? 'Đổi ngay' : 'Chưa đủ điểm'}
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
                                        <p className="text-sm font-medium text-foreground truncate">{coupon.description || 'Mã giảm giá Torii'}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Hạn dùng: {coupon.validUntil ? formatDate(coupon.validUntil) : 'Không giới hạn'}
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
            <RedeemConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                selectedDeal={selectedDeal}
                isLoading={redeemMutation.isPending}
                onConfirm={handleConfirmRedeem}
            />

            {/* Success Dialog */}
            <RedeemSuccessDialog
                open={!!redeemedCoupon}
                onOpenChange={(open) => !open && setRedeemedCoupon(null)}
                coupon={redeemedCoupon}
                pointsDeducted={selectedDeal?.costPoints || null}
            />
        </div>
    )
}
