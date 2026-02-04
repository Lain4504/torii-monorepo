'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface StatItem {
    label: string
    value: string
    icon: LucideIcon
    color: string
    bgColor: string
}

interface StatsOverviewProps {
    stats: StatItem[]
    isLoading?: boolean
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="px-6 py-5 rounded-2xl border border-border bg-card animate-pulse">
                        <div className="h-3 bg-muted rounded mb-2 w-20" />
                        <div className="h-6 bg-muted rounded w-16" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="group p-5 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                    <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">{stat.label}</p>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                            stat.bgColor,
                            stat.color
                        )}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-black text-foreground">{stat.value}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
