'use client'

import { useState, useMemo } from 'react'
import { AchievementBadge } from './AchievementBadge'
import {
    Award,
    Flame,
    Calendar,
    TrendingUp,
    Trophy,
    Star,
    BookOpen,
    Target,
    GraduationCap,
    Zap,
    Heart,
    FileText
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Badge } from '@workspace/ui/components/badge'

interface AchievementsTabProps {
    achievements: any[]
    isLoading: boolean
}

const achievementIconMap: Record<string, any> = {
    Flame,
    Calendar,
    TrendingUp,
    Trophy,
    Star,
    BookOpen,
    Target,
    GraduationCap,
    Zap,
    Heart,
    Award,
    FileText
}

const CATEGORIES = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'STREAK', label: 'Chuỗi học' },
    { id: 'LEARNING_PROGRESS', label: 'Tiến độ' },
    { id: 'MASTERY', label: 'Thành thạo' },
    { id: 'CONSISTENCY', label: 'Chăm chỉ' },
]

export function AchievementsTab({ achievements, isLoading }: AchievementsTabProps) {
    const [activeCategory, setActiveCategory] = useState('ALL')

    const filteredAchievements = useMemo(() => {
        if (activeCategory === 'ALL') return achievements
        return achievements.filter(a => a.achievement.category === activeCategory)
    }, [achievements, activeCategory])

    const stats = useMemo(() => {
        const total = achievements.length
        const unlocked = achievements.filter(a => a.isUnlocked).length
        return {
            total,
            unlocked,
            percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
        }
    }, [achievements])

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-40 rounded-3xl bg-muted" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Achievement Summary Section */}
            <div className="flex flex-col md:flex-row gap-6 items-center p-6 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-primary/10 shadow-inner">
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-bold">Thành tích tổng quát</h3>
                    <p className="text-sm text-muted-foreground">
                        Bạn đã mở khóa <span className="font-bold text-primary">{stats.unlocked}</span> trên tổng số <span className="font-bold">{stats.total}</span> thành tích.
                    </p>
                </div>
                <div className="w-full md:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span>Hoàn thành</span>
                        <span>{stats.percentage}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary-foreground transition-all duration-1000 ease-out"
                            style={{ width: `${stats.percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Categorization Tabs */}
            <div className="flex flex-wrap gap-2 pb-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                            activeCategory === cat.id
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Badges Grid */}
            {filteredAchievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAchievements.map((item) => {
                        const iconName = item.achievement.icon ?? 'Award'
                        const Icon = (iconName in achievementIconMap)
                            ? achievementIconMap[iconName]
                            : Award

                        return (
                            <AchievementBadge
                                key={item.id}
                                title={item.achievement.title}
                                description={item.achievement.description}
                                icon={Icon}
                                isUnlocked={item.isUnlocked}
                                unlockedAt={item.unlockedAt}
                                category={item.achievement.category}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
                    <Trophy className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">Không tìm thấy thành tích trong mục này</p>
                </div>
            )}
        </div>
    )
}
