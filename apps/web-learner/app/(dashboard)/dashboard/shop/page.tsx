'use client'

import { useShopItems, useBuyItem, useGamificationProfile } from '@/apis/services/gamification-api'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { PageLoading } from '@workspace/ui/components/page-loading'
import {
    Coins,
    Flame,
    Heart,
    Zap,
    Crown,
    ShoppingBag,
    ArrowRight
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

export default function ShopPage() {
    const { data: items, isLoading: isItemsLoading } = useShopItems()
    const { data: profile, isLoading: isProfileLoading } = useGamificationProfile()
    const buyMutation = useBuyItem()

    if (isItemsLoading || isProfileLoading) {
        return <PageLoading text="Đang chuẩn bị cửa hàng..." />
    }

    const iconMap: Record<string, any> = {
        'STREAK_FREEZE': Flame,
        'HEART_REFILL': Heart,
        'XP_BOOST': Zap,
        'PREMIUM_BADGE': Crown,
    }

    const colorMap: Record<string, string> = {
        'STREAK_FREEZE': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        'HEART_REFILL': 'text-red-500 bg-red-500/10 border-red-500/20',
        'XP_BOOST': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        'PREMIUM_BADGE': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-6xl animate-in fade-in duration-500">
            {/* Header / Wallet Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-border/40">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-10 bg-primary/40 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase">
                            Cửa hàng <span className="text-primary not-italic">Torii</span>
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground/60 italic pl-5">
                        Sử dụng Torii Coins bạn kiếm được để mua các vật phẩm hỗ trợ học tập.
                    </p>
                </div>

                <div className="p-6 md:p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 backdrop-blur-3xl flex items-center gap-6 shadow-xl shadow-amber-500/5">
                    <div className="p-4 rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/20">
                        <Coins className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60 mb-1">Số dư hiện tại</p>
                        <p className="text-4xl font-serif font-bold italic tracking-tighter text-amber-500 leading-none">
                            {profile?.coins || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Shop Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items?.map((item) => {
                    const Icon = iconMap[item.code] || ShoppingBag
                    const colorClass = colorMap[item.code] || 'text-primary bg-primary/5 border-primary/10'
                    const canAfford = (profile?.coins || 0) >= item.price

                    return (
                        <Card
                            key={item.id}
                            className="group relative overflow-hidden rounded-[3rem] border border-border/40 bg-background/40 backdrop-blur-3xl hover:border-primary/40 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-primary/5"
                        >
                            <CardContent className="p-10 space-y-8">
                                <div className={cn(
                                    "w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-inner",
                                    colorClass
                                )}>
                                    <Icon className="w-8 h-8" />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-serif font-bold italic tracking-tight text-foreground">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground/60 italic leading-relaxed min-h-[3rem]">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-border/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-amber-500" />
                                        <span className="text-xl font-serif font-bold italic">{item.price}</span>
                                    </div>

                                    <Button
                                        onClick={() => buyMutation.mutate(item.code)}
                                        disabled={!canAfford || buyMutation.isPending}
                                        className={cn(
                                            "rounded-2xl px-6 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500",
                                            canAfford
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1"
                                                : "bg-muted text-muted-foreground cursor-not-allowed grayscale"
                                        )}
                                    >
                                        {buyMutation.isPending && buyMutation.variables === item.code
                                            ? "Đang mua..."
                                            : canAfford ? "Mua ngay" : "Không đủ xu"
                                        }
                                    </Button>
                                </div>
                            </CardContent>

                            {/* Decorative background element */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        </Card>
                    )
                })}
            </div>

            {/* Empty state */}
            {items?.length === 0 && (
                <div className="text-center py-20 rounded-[3rem] border-2 border-dashed border-border/40">
                    <p className="text-muted-foreground italic">Cửa hàng đang bảo trì, vui lòng quay lại sau.</p>
                </div>
            )}
        </div>
    )
}
