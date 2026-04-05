"use client"

import * as React from "react"
import { Check, Zap, Star, Crown, ArrowRight, BadgeCheck, Coins } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { formatCurrency } from "@/utils/format-utils"
import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import { orderApi } from "@/lib/api/services/order-api"
import { PaymentMethod } from "@workspace/schemas"
import { useAppSelector } from "@/hooks/hooks"

interface Tier {
    id: string
    code: string
    name: string
    price: number
    quota: string
    description: string
    features: string[]
    icon: React.ReactNode
    popular?: boolean
    color: string
}

const tiers: Tier[] = [
    {
        id: "free",
        code: "free",
        name: "Free",
        price: 0,
        quota: "10 lượt/ngày",
        description: "Dành cho người mới bắt đầu khám phá AI Sensei.",
        features: [
            "10 lượt check ngữ pháp/ngày",
            "10 lượt dịch thuật/ngày",
            "Truy cập cơ bản AI Sensei Chat",
            "Hỗ trợ qua cộng đồng"
        ],
        icon: <Zap className="size-6" />,
        color: "text-slate-500 bg-slate-500/10 border-slate-500/20"
    },
    {
        id: "plus",
        code: "plus",
        name: "Plus",
        price: 50000,
        quota: "100 lượt/ngày",
        description: "Gói phổ biến nhất cho người học nghiêm túc.",
        features: [
            "100 lượt sử dụng AI mỗi ngày",
            "Không giới hạn dịch thuật",
            "Truy cập đầy đủ Roleplay & Voice",
            "Ưu tiên phản hồi từ AI",
            "Hỗ trợ ưu tiên"
        ],
        popular: true,
        icon: <Star className="size-6 text-amber-500 fill-amber-500" />,
        color: "text-amber-600 bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20"
    },
    {
        id: "premium",
        code: "premium",
        name: "Premium",
        price: 125000,
        quota: "5000 lượt/ngày",
        description: "Trải nghiệm không giới hạn cùng AI Sensei.",
        features: [
            "5000 lượt (Gần như vô hạn) mỗi ngày",
            "Mọi tính năng AI Sensei mới nhất",
            "Giao diện không quảng cáo",
            "Tùy chỉnh giọng nói AI",
            "Hỗ trợ 1-1 chuyên sâu"
        ],
        icon: <Crown className="size-6 text-purple-600 fill-purple-600" />,
        color: "text-purple-600 bg-purple-500/10 border-purple-500/30"
    }
]

import { useQuery } from "@tanstack/react-query"
import { agentApi } from "@/lib/api/services/agent-api"

export default function SubscriptionsPage() {
    const router = useRouter()
    const [loadingTier, setLoadingTier] = React.useState<string | null>(null)

    const { data: quota } = useQuery({
        queryKey: ['quota-status'],
        queryFn: () => agentApi.sensei.getQuotaStatus(),
    })

    const { data: remotePlans, isLoading: isPlansLoading } = useQuery({
        queryKey: ['ai-subscription-plans'],
        queryFn: () => agentApi.sensei.getPlans(),
    })

    const currentTier = quota?.tier?.toLowerCase() || 'free'

    const getTierConfig = (code: string) => {
        switch (code.toLowerCase()) {
            case 'premium':
                return {
                    icon: <Crown className="size-6 text-purple-600 fill-purple-600" />,
                    color: "text-purple-600 bg-purple-500/10 border-purple-500/30",
                    popular: false
                }
            case 'plus':
                return {
                    icon: <Star className="size-6 text-amber-500 fill-amber-500" />,
                    color: "text-amber-600 bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20",
                    popular: true
                }
            default:
                return {
                    icon: <Zap className="size-6" />,
                    color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
                    popular: false
                }
        }
    }

    const tiers: Tier[] = (remotePlans || []).map(p => {
        const config = getTierConfig(p.code)
        return {
            id: p.id,
            code: p.code,
            name: p.name,
            price: Number(p.price),
            quota: `${p.quotas?.ai_turns || 10} lượt/ngày`,
            description: p.description || "Dành cho người dùng AI Sensei.",
            features: p.features || [],
            icon: config.icon,
            color: config.color,
            popular: config.popular
        }
    })

    const currentTierIndex = tiers.findIndex(t => t.code === currentTier)

    const user = useAppSelector(state => state.auth.user)

    const handleSubscribe = async (tier: Tier, method: PaymentMethod = PaymentMethod.PAYOS) => {
        const targetTierIndex = tiers.findIndex(t => t.id === tier.id)

        if (targetTierIndex < currentTierIndex && currentTier !== 'free') {
            toast.info("Bạn không thể mua gói này vì đang dùng gói tiện ích cao hơn.")
            return
        }

        if (tier.code === currentTier) {
            toast.info("Bạn đang sử dụng gói này.")
            return
        }

        if (tier.price === 0) {
            toast.info("Gói Free đã được kích hoạt mặc định cho bạn.")
            return
        }

        setLoadingTier(tier.id)
        try {
            const response = await orderApi.createOrder({
                subscriptionPlanIds: [tier.id], // Fix: use subscriptionPlanIds
                description: `Đăng ký gói ${tier.name} - Torii AI Sensei`,
                couponCode: "",
                paymentMethod: method
            })

            if (response.paymentUrl) {
                toast.success("Đang chuyển hướng đến trang thanh toán...")
                window.location.href = response.paymentUrl
            } else {
                router.push(`/dashboard/payment?orderId=${response.id}`)
                toast.success("Đã tạo đơn hàng thành công!")
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể khởi tạo thanh toán. Vui lòng thử lại sau.")
        } finally {
            setLoadingTier(null)
        }
    }

    if (isPlansLoading) {
        return (
            <div className="container max-w-6xl mx-auto py-12 px-4 space-y-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
                    <div className="h-12 w-96 bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[500px] rounded-3xl bg-muted/30 animate-pulse border border-border" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/30 text-primary font-bold animate-pulse">
                    AI SENSEI SUBSCRIPTIONS
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Nâng cấp kỹ năng Tiếng Nhật cùng AI
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    Chọn gói đăng ký phù hợp để tận dụng tối đa sức mạnh của AI Sensei trong hành trình chinh phục ngôn ngữ.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10">
                {tiers.map((tier, index) => {
                    const isCurrent = tier.code === currentTier
                    const isDowngrade = index < currentTierIndex && currentTier !== 'free'
                    return (
                        <Card key={tier.id} className={cn(
                            "relative flex flex-col h-full border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-visible",
                            tier.popular ? "border-amber-500 shadow-amber-500/10" : "border-border hover:border-primary/50",
                            isCurrent && "border-primary shadow-lg shadow-primary/5 bg-primary/5"
                        )}>
                            {isCurrent ? (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider z-20 whitespace-nowrap">
                                    <BadgeCheck className="size-3 fill-white" /> Kế hoạch hiện tại
                                </div>
                            ) : tier.popular ? (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider z-20 whitespace-nowrap">
                                    <Star className="size-3 fill-white" /> Phổ biến nhất
                                </div>
                            ) : null}

                            <CardHeader className="space-y-4 pt-8">
                                <div className={cn(
                                    "size-12 rounded-2xl flex items-center justify-center mb-2",
                                    tier.color
                                )}>
                                    {tier.icon}
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                                        {isCurrent && <Badge variant="secondary" className="bg-primary/20 text-primary border-none font-bold text-[10px]">CURRENT</Badge>}
                                    </div>
                                    <CardDescription className="text-sm font-medium h-10 mt-2">
                                        {tier.description}
                                    </CardDescription>
                                </div>
                                <div className="py-4 border-y border-border/50">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{tier.price === 0 ? "0đ" : formatCurrency(tier.price)}</span>
                                        <span className="text-muted-foreground font-bold text-sm">/tháng</span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-primary font-bold text-sm">
                                        <Zap className="size-3.5 fill-primary" />
                                        {tier.quota}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm font-medium">
                                            <div className="mt-0.5 rounded-full bg-emerald-500/10 p-0.5">
                                                <Check className="size-3.5 text-emerald-600" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-8">
                                <Button
                                    className={cn(
                                        "w-full h-12 rounded-xl font-bold text-base transition-all group",
                                        tier.popular ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20" : "bg-primary hover:bg-primary/90",
                                        (isCurrent || isDowngrade) && "bg-muted text-muted-foreground hover:bg-muted cursor-default border-none shadow-none"
                                    )}
                                    onClick={() => handleSubscribe(tier, PaymentMethod.PAYOS)}
                                    disabled={loadingTier === tier.id || isCurrent || isDowngrade}
                                >
                                    {loadingTier === tier.id ? (
                                        "Đang xử lý..."
                                    ) : isCurrent ? (
                                        "Gói hiện tại"
                                    ) : isDowngrade ? (
                                        "Đã vượt qua gói này"
                                    ) : (
                                        <>
                                            {tier.price === 0 ? "Bắt đầu ngay" : "Nâng cấp ngay"}
                                            <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>

                                {user?.walletBalance !== undefined && user.walletBalance >= tier.price && tier.price > 0 && !isCurrent && !isDowngrade && (
                                    <button 
                                        className="w-full mt-3 text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors group/coin"
                                        onClick={() => handleSubscribe(tier, PaymentMethod.COIN)}
                                        disabled={loadingTier === tier.id}
                                    >
                                        <Coins className="size-3 transition-transform group-hover/coin:scale-110" />
                                        Thanh toán bằng {tier.price.toLocaleString()} Xu
                                    </button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            <div className="text-center bg-muted/30 p-8 rounded-3xl border border-border/50 max-w-3xl mx-auto mt-12">
                <h3 className="text-lg font-bold mb-2">Câu hỏi thường gặp?</h3>
                <p className="text-sm text-muted-foreground font-medium">
                    Bạn có thể nâng cấp hoặc hủy gói đăng ký bất kỳ lúc nào. Lượt sử dụng AI sẽ được reset vào 00:00 mỗi ngày.
                    <br />
                    Mọi thắc mắc xin vui lòng liên hệ <span className="text-primary font-bold">support@torii.com</span>
                </p>
            </div>
        </div>
    )
}
