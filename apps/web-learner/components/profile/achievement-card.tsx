'use client'

import { cn } from '@workspace/ui/lib/utils'
import {
    Flame,
    Calendar,
    TrendingUp,
    Trophy,
    Star,
    BookOpen,
    Target,
    GraduationCap,
    Award,
    Zap,
    Heart,
    Lock
} from 'lucide-react'
import { format } from 'date-fns'

interface AchievementCardProps {
    achievement: {
        id: string
        isUnlocked: boolean
        unlockedAt: string | null
        progress: any
        achievement: {
            code: string
            title: string
            description: string
            icon: string | null
            category: string
        }
    }
}

const ICON_MAP: Record<string, any> = {
    Flame,
    Calendar,
    TrendingUp,
    Trophy,
    Star,
    BookOpen,
    Target,
    GraduationCap,
    Award,
    Zap,
    Heart,
}

export function AchievementCard({ achievement }: AchievementCardProps) {
    const { isUnlocked, unlockedAt, achievement: def } = achievement
    const IconComponent = def.icon && ICON_MAP[def.icon] ? ICON_MAP[def.icon] : Trophy

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
                isUnlocked
                    ? "bg-card border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 shadow-sm"
                    : "bg-muted/30 border-dashed border-muted-foreground/20 opacity-70 grayscale"
            )}
        >
            {/* Background Accent */}
            {isUnlocked && (
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
            )}

            <div className="flex items-start gap-4">
                <div
                    className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                        isUnlocked
                            ? "bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-3 shadow-inner"
                            : "bg-muted text-muted-foreground/50"
                    )}
                >
                    {isUnlocked ? (
                        <IconComponent className="size-6" />
                    ) : (
                        <Lock className="size-5" />
                    )}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h4 className={cn(
                            "text-sm font-bold transition-colors",
                            isUnlocked ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {def.title}
                        </h4>
                        {isUnlocked && (
                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {def.description}
                    </p>

                    {isUnlocked && unlockedAt && (
                        <p className="pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                            Đạt được vào {format(new Date(unlockedAt), 'dd/MM/yyyy')}
                        </p>
                    )}

                    {!isUnlocked && (
                        <div className="pt-2">
                            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-muted-foreground/20 w-1/3" />
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground/50 italic">
                                Chờ mở khóa...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Shine Effect */}
            {isUnlocked && (
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            )}
        </div>
    )
}
