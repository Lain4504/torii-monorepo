'use client'

import { cn } from '@workspace/ui/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip'

interface AchievementBadgeProps {
    title: string
    description: string
    icon: LucideIcon
    isUnlocked: boolean
    unlockedAt?: string | null
    category: string
}

export function AchievementBadge({
    title,
    description,
    icon: Icon,
    isUnlocked,
    unlockedAt,
    category
}: AchievementBadgeProps) {
    const categoryColors: Record<string, string> = {
        STREAK: 'from-orange-500 to-red-500',
        LEARNING_PROGRESS: 'from-blue-500 to-indigo-500',
        MASTERY: 'from-purple-500 to-pink-500',
        CONSISTENCY: 'from-emerald-500 to-teal-500',
    }

    const shadowColors: Record<string, string> = {
        STREAK: 'shadow-orange-200 dark:shadow-orange-900/20',
        LEARNING_PROGRESS: 'shadow-blue-200 dark:shadow-blue-900/20',
        MASTERY: 'shadow-purple-200 dark:shadow-purple-900/20',
        CONSISTENCY: 'shadow-emerald-200 dark:shadow-emerald-900/20',
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "relative group flex flex-col items-center justify-center p-4 rounded-3xl border transition-all duration-300 cursor-help",
                            isUnlocked
                                ? cn(
                                    "bg-card border-border shadow-sm hover:shadow-xl hover:-translate-y-1",
                                    shadowColors[category] || 'shadow-gray-200'
                                )
                                : "bg-muted/30 border-dashed border-muted-foreground/20 grayscale opacity-60"
                        )}
                    >
                        {/* Glow effect for unlocked badges */}
                        {isUnlocked && (
                            <div className={cn(
                                "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br",
                                categoryColors[category] || 'from-primary to-primary/50'
                            )} />
                        )}

                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                            isUnlocked
                                ? cn("bg-gradient-to-br text-white shadow-lg", categoryColors[category] || 'from-primary to-primary/50')
                                : "bg-muted text-muted-foreground"
                        )}>
                            <Icon className="w-8 h-8" />
                        </div>

                        <div className="text-center space-y-1 w-full">
                            <p className={cn(
                                "text-sm font-bold truncate px-1",
                                isUnlocked ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {title}
                            </p>
                            {isUnlocked && unlockedAt && (
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    {new Date(unlockedAt).toLocaleDateString('vi-VN')}
                                </p>
                            )}
                        </div>

                        {!isUnlocked && (
                            <div className="absolute top-2 right-2">
                                <Icon className="w-3 h-3 text-muted-foreground/40" />
                            </div>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] p-3 text-center rounded-xl">
                    <p className="font-bold mb-1">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                    {!isUnlocked && (
                        <p className="text-[10px] mt-2 font-bold text-amber-500 flex items-center justify-center gap-1 uppercase tracking-wider">
                            Chưa mở khoá
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
