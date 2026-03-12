"use client"

import * as React from "react"
import { Check, Zap, Star, Crown, ArrowRight, BadgeCheck, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { formatCurrency } from "@/utils/format-utils"
import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import { orderApi } from "@/lib/api/services/order-api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { agentApi, useSubscriptionPlans, AiSubscriptionPlan } from "@/lib/api/services/agent-api"

// Map plan code to display config (icon, color, popular)
const PLAN_DISPLAY_CONFIG: Record<string, { icon: React.ReactNode; color: string; popular?: boolean }> = {
    free: {
        icon: <Zap className="size-6" />,
        color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    },
    plus: {
        icon: <Star className="size-6 text-amber-500 fill-amber-500" />,
        color: "text-amber-600 bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20",
        popular: true,
    },
    premium: {
        icon: <Crown className="size-6 text-purple-600 fill-purple-600" />,
        color: "text-purple-600 bg-purple-500/10 border-purple-500/30",
    },
}

export default function SubscriptionsPage() {
    const router = useRouter()
    const [loadingTier, setLoadingTier] = React.useState<string | null>(null)

    const { data: quota } = useQuery({
        queryKey: ['quota-status'],
        queryFn: () => agentApi.sensei.getQuotaStatus(),
    })

    const { data: plans = [], isLoading: plansLoading } = useSubscriptionPlans()

    const queryClient = useQueryClient()
    const currentTier = quota?.tier?.toLowerCase() || 'free'
    const currentTierIndex = plans.findIndex(p => p.code === currentTier)

    const handleSubscribe = async (plan: AiSubscriptionPlan) => {
        const targetTierIndex = plans.findIndex(p => p.code === plan.code)

        if (targetTierIndex < currentTierIndex) {
            toast.info("Bạn không thể mua gói này vì đang dùng gói tiện ích cao hơn.")
            return
        }

        if (plan.code === currentTier) {
            toast.info("Bạn đang sử dụng gói này.")
            return
        }

        if (plan.price === 0) {
            toast.info("Gói Free đã được kích hoạt mặc định cho bạn.")
            return
        }

        setLoadingTier(plan.code)
        try {
            const response = await orderApi.createOrder({
                offeringIds: [plan.code],
                description: `Đăng ký gói ${plan.name} - Torii AI Sensei`,
                couponCode: "",
                paymentMethod: "PAYOS"
            })

            if (response.paymentUrl) {
                toast.success("Đang chuyển hướng đến trang thanh toán...")
                window.location.href = response.paymentUrl
            } else {
                // For fast-path/instant activation
                if (response.status === 'PAID') {
                    // CRITICAL: Invalidate quota so the header QuotaIndicator updates immediately
                    await Promise.all([
                        queryClient.invalidateQueries({ queryKey: ['quota-status'] }),
                        queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
                    ])
                    toast.success(`Chúc mừng! Gói ${plan.name} đã được kích hoạt.`)
                    router.push('/dashboard/payment')
                } else {
                    router.push(`/dashboard/payment?orderId=${response.id}`)
                    toast.success("Đã tạo đơn hàng thành công!")
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể khởi tạo thanh toán. Vui lòng thử lại sau.")
        } finally {
            setLoadingTier(null)
        }
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/30 text-primary font-bold animate-pulse">
                    AI SENSEI SUBSCRIPTIONS
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600">
                    Nâng cấp kỹ năng Tiếng Nhật cùng AI
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    Chọn gói đăng ký phù hợp để tận dụng tối đa sức mạnh của AI Sensei trong hành trình chinh phục ngôn ngữ.
                </p>
            </div>

            {plansLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10">
                    {plans.map((plan, index) => {
                        const isCurrent = plan.code === currentTier
                        const isDowngrade = index < currentTierIndex
                        const displayConfig = PLAN_DISPLAY_CONFIG[plan.code] ?? {
                            icon: <Zap className="size-6" />,
                            color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
                        }
                        const aiTurns = plan.quotas?.ai_turns ?? 0

                        return (
                            <Card key={plan.id} className={cn(
                                "relative flex flex-col h-full border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-visible",
                                displayConfig.popular ? "border-amber-500 shadow-amber-500/10" : "border-border hover:border-primary/50",
                                isCurrent && "border-primary shadow-lg shadow-primary/5 bg-primary/5"
                            )}>
                                {isCurrent ? (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider z-20 whitespace-nowrap">
                                        <BadgeCheck className="size-3 fill-white" /> Kế hoạch hiện tại
                                    </div>
                                ) : displayConfig.popular ? (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider z-20 whitespace-nowrap">
                                        <Star className="size-3 fill-white" /> Phổ biến nhất
                                    </div>
                                ) : null}

                                <CardHeader className="space-y-4 pt-8">
                                    <div className={cn(
                                        "size-12 rounded-2xl flex items-center justify-center mb-2",
                                        displayConfig.color
                                    )}>
                                        {displayConfig.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                                            {isCurrent && <Badge variant="secondary" className="bg-primary/20 text-primary border-none font-black text-[10px]">CURRENT</Badge>}
                                        </div>
                                        <CardDescription className="text-sm font-medium h-10 mt-2">
                                            {plan.description}
                                        </CardDescription>
                                    </div>
                                    <div className="py-4 border-y border-border/50">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black">{plan.price === 0 ? "0đ" : formatCurrency(plan.price)}</span>
                                            <span className="text-muted-foreground font-bold text-sm">
                                                {plan.billingCycle === 'LIFETIME' ? '' : plan.billingCycle === 'YEARLY' ? '/năm' : '/tháng'}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-primary font-black text-sm">
                                            <Zap className="size-3.5 fill-primary" />
                                            {aiTurns >= 5000 ? `${aiTurns.toLocaleString()} lượt/ngày` : `${aiTurns} lượt/ngày`}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <ul className="space-y-3">
                                        {(plan.features as string[]).map((feature, idx) => (
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
                                            displayConfig.popular ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20" : "bg-primary hover:bg-primary/90",
                                            (isCurrent || isDowngrade) && "bg-muted text-muted-foreground hover:bg-muted cursor-default border-none shadow-none"
                                        )}
                                        onClick={() => handleSubscribe(plan)}
                                        disabled={loadingTier === plan.code || isCurrent || isDowngrade}
                                    >
                                        {loadingTier === plan.code ? (
                                            <><Loader2 className="size-4 mr-2 animate-spin" /> Đang xử lý...</>
                                        ) : isCurrent ? (
                                            "Gói hiện tại"
                                        ) : isDowngrade ? (
                                            "Đã vượt qua gói này"
                                        ) : (
                                            <>
                                                {plan.price === 0 ? "Bắt đầu ngay" : "Nâng cấp ngay"}
                                                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}

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
