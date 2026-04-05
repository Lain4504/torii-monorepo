"use client"

import * as React from "react"
import { Check, Zap, Star, Crown, ArrowRight, BadgeCheck, Coins, HelpCircle } from "lucide-react"
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
import { useQuery } from "@tanstack/react-query"
import { agentApi } from "@/lib/api/services/agent-api"
import { Separator } from "@workspace/ui/components/separator"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@workspace/ui/components/alert-dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"

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


export default function SubscriptionsPage() {
    const router = useRouter()
    const [loadingTier, setLoadingTier] = React.useState<string | null>(null)
    const [selectedTier, setSelectedTier] = React.useState<{ tier: Tier, method: PaymentMethod } | null>(null)
    const [confirmOpen, setConfirmOpen] = React.useState(false)

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

    const handleConfirmSubscribe = (tier: Tier, method: PaymentMethod = PaymentMethod.PAYOS) => {
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

        setSelectedTier({ tier, method })
        setConfirmOpen(true)
    }

    const processSubscription = async () => {
        if (!selectedTier) return
        
        const { tier, method } = selectedTier
        setConfirmOpen(false)
        setLoadingTier(tier.id)
        
        try {
            const response = await orderApi.createOrder({
                subscriptionPlanIds: [tier.id],
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
            setSelectedTier(null)
        }
    }

    if (isPlansLoading) {
        return (
            <div className="container max-w-6xl mx-auto py-12 px-4 space-y-12">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-8 w-64 rounded-full" />
                    <Skeleton className="h-12 w-3/4 sm:w-[500px]" />
                    <Skeleton className="h-6 w-1/2 sm:w-[400px]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="h-[600px] border-border/50">
                            <CardHeader className="space-y-4">
                                <Skeleton className="h-12 w-12 rounded-2xl" />
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-8">
            {/* Standard Header */}
            <div className="space-y-4 pb-8 border-b border-border">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Nâng tầm học tập</h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Mở khóa toàn bộ tiềm năng của AI Sensei và đẩy nhanh hành trình học Tiếng Nhật của bạn thông qua các gói dịch vụ cao cấp.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.map((tier, index) => {
                    const isCurrent = tier.code === currentTier
                    const isDowngrade = index < currentTierIndex && currentTier !== 'free'
                    
                    return (
                        <Card key={tier.id} className={cn(
                            "relative flex flex-col h-full border-border/40 bg-card hover:bg-muted/5 transition-all duration-300 rounded-2xl overflow-hidden shadow-none group",
                            isCurrent && "border-primary/50 bg-primary/[0.02]"
                        )}>
                            
                            {tier.popular && (
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-amber-500 text-white border-none px-2.5 py-1 rounded-lg font-bold text-[10px] shadow-sm">
                                        Phổ biến
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="space-y-3 pt-6 pb-4">
                                <div className="size-10 rounded-xl flex items-center justify-center bg-primary/5 text-primary [&>svg]:size-5">
                                    {tier.icon}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg font-bold tracking-tight">{tier.name}</CardTitle>
                                        {isCurrent && (
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold h-5 text-[9px]">
                                                Hiện tại
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="text-[12px] font-medium text-muted-foreground/60 line-clamp-2">
                                        {tier.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-6 pt-0">
                                <div className="space-y-2">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold tracking-tight">
                                            {tier.price === 0 ? "Miễn phí" : formatCurrency(tier.price)}
                                        </span>
                                        {tier.price > 0 && <span className="text-[10px] font-semibold text-muted-foreground/40 leading-none ml-0.5">/tháng</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] bg-primary/5 w-fit px-2.5 py-1 rounded-lg">
                                        <Zap className="size-3 fill-primary" />
                                        {tier.quota}
                                    </div>
                                </div>

                                <Separator className="bg-border/20" />

                                <ul className="space-y-2.5">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-[12px] font-medium leading-tight text-foreground/70">
                                            <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-2 pb-6 pt-2">
                                <Button
                                    className={cn(
                                        "w-full h-9 rounded-xl font-bold text-[11px] transition-all shadow-none",
                                        tier.popular ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary hover:bg-primary/95",
                                        (isCurrent || isDowngrade) && "bg-muted text-muted-foreground hover:bg-muted cursor-default border-transparent"
                                    )}
                                    onClick={() => handleConfirmSubscribe(tier, PaymentMethod.PAYOS)}
                                    disabled={loadingTier === tier.id || isCurrent || isDowngrade}
                                >
                                    {loadingTier === tier.id ? (
                                        <Zap className="size-3 animate-spin mr-1.5" />
                                    ) : isCurrent ? (
                                        <BadgeCheck className="size-3.5 mr-1.5" />
                                    ) : null}
                                    
                                    {isCurrent ? "Đang sử dụng" : isDowngrade ? "Đã vượt gói" : tier.price === 0 ? "Bắt đầu ngay" : "Nâng cấp gói"}
                                </Button>

                                {user?.walletBalance !== undefined && user.walletBalance >= tier.price && tier.price > 0 && !isCurrent && !isDowngrade && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-[10px] font-bold text-muted-foreground/50 hover:text-primary transition-colors px-0 flex items-center justify-center gap-1.5 h-auto py-1.5"
                                        onClick={() => handleConfirmSubscribe(tier, PaymentMethod.COIN)}
                                        disabled={loadingTier === tier.id}
                                    >
                                        <Coins className="size-3" />
                                        Dùng {tier.price.toLocaleString()} Xu
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            <div className="max-w-3xl mx-auto rounded-2xl border border-border/50 bg-muted/20 p-8 sm:p-10 transition-colors hover:bg-muted/30">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="size-12 shrink-0 rounded-2xl bg-background flex items-center justify-center shadow-sm border border-border/50">
                        <HelpCircle className="size-6 text-primary" />
                    </div>
                    <div className="space-y-4 text-center sm:text-left">
                        <h3 className="text-xl font-bold">Bạn có câu hỏi?</h3>
                        <p className="text-[14px] text-muted-foreground font-medium leading-relaxed">
                            Mọi thắc mắc về các gói đăng ký hoặc yêu cầu hỗ trợ đặc biệt, xin vui lòng liên hệ đội ngũ Torii tại <span className="text-primary font-bold hover:underline cursor-pointer">support@torii.com</span>. Chúng tôi luôn sẵn sàng đồng hành cùng bạn trên con đường chinh phục Tiếng Nhật.
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-[12px] font-bold text-muted-foreground/80 tracking-wider">
                            <span>Hủy bất cứ lúc nào</span>
                            <span className="hidden sm:inline opacity-30">•</span>
                            <span>Mã hóa bảo mật</span>
                            <span className="hidden sm:inline opacity-30">•</span>
                            <span>Hỗ trợ 24/7</span>
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="rounded-2xl max-w-[400px]">
                    <AlertDialogHeader className="space-y-3">
                        <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-1">
                            <Zap className="size-6 text-amber-600 fill-amber-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold">Xác nhận nâng cấp gói</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                            Bạn đang chọn nâng cấp lên gói <span className="text-foreground font-bold">{selectedTier?.tier.name}</span> với mức phí <span className="text-primary font-bold">{selectedTier?.tier.price ? formatCurrency(selectedTier.tier.price) : "0đ"}</span> / tháng. 
                            <br /><br />
                            Bạn có đồng ý tiến hành thanh toán và kích hoạt gói ngay bây giờ không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4 flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="rounded-xl font-bold border-none bg-muted text-muted-foreground hover:bg-muted/80 h-10 sm:flex-1">
                            Hủy bỏ
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault()
                                processSubscription()
                            }}
                            className="rounded-xl font-bold bg-primary hover:bg-primary/90 h-10 sm:flex-1"
                        >
                            Đồng ý nâng cấp
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
