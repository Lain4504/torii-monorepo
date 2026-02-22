'use client'

import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@workspace/ui/components/empty'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Gift, Star, Ticket, ArrowRight, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { useGamificationProfile, useRewards, useRedeemPoints } from '@/apis/services/gamification-api'
import { useMyCoupons } from '@/apis/services/coupon-api'
import { toast } from 'sonner'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"

export default function RewardsPage() {
    const { data: profile, isLoading: profileLoading } = useGamificationProfile()
    const { data: rewards, isLoading: rewardsLoading } = useRewards()
    const { data: coupons } = useMyCoupons(profile?.userId)
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
            setRedeemedCoupon(result.coupon)
            setIsConfirmOpen(false)
            toast.success('Đổi quà thành công!')
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

                <div className="bg-primary/5 border border-primary/10 rounded-xl px-6 py-4 flex items-center gap-4 shadow-sm">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Star className="size-6 text-primary fill-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Điểm hiện có</p>
                        <p className="text-2xl font-black text-primary">{profile?.points?.toLocaleString() || 0} Points</p>
                    </div>
                </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewards?.map((reward) => (
                    <Card key={reward.id} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Gift className="size-16" />
                        </div>

                        <CardHeader>
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                {reward.type === 'percentage' ? <TrendingUp className="size-5 text-primary" /> : <Ticket className="size-5 text-primary" />}
                            </div>
                            <CardTitle className="text-xl">{reward.name}</CardTitle>
                            <CardDescription>{reward.description}</CardDescription>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {reward.minOrderAmount && (
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto font-normal">
                                        Đơn tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reward.minOrderAmount)}
                                    </Badge>
                                )}
                                {reward.maxDiscountAmount && (
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto font-normal">
                                        Giảm tối đa: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reward.maxDiscountAmount)}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <Star className="size-4 fill-primary" />
                                <span>{reward.pointsContent}</span>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                className="w-full rounded-xl font-bold group"
                                variant={(profile?.points || 0) >= reward.points ? "default" : "outline"}
                                disabled={(profile?.points || 0) < reward.points || redeemMutation.isPending}
                                onClick={() => handleRedeemClick(reward)}
                            >
                                {(profile?.points || 0) >= reward.points ? 'Đổi ngay' : 'Chưa đủ điểm'}
                                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
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
                                            Hạn dùng: {new Date(coupon.validUntil).toLocaleDateString('vi-VN')}
                                            {coupon.maxDiscountAmount && ` • Giảm tối đa ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(coupon.maxDiscountAmount))}`}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-lg font-bold shrink-0" onClick={() => {
                                    navigator.clipboard.writeText(coupon.code)
                                    toast.success('Đã sao chép mã!')
                                }}>
                                    Sao chép
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Empty>
                        <EmptyMedia variant="icon" className="bg-muted/20">
                            <Ticket className="size-8 text-muted-foreground/30" />
                        </EmptyMedia>
                        <EmptyContent>
                            <EmptyTitle>Chưa có mã giảm giá</EmptyTitle>
                            <EmptyDescription>Hãy tích lũy điểm và đổi quà nhé!</EmptyDescription>
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
        </div>
    )
}
