'use client'

import { useAchievements } from '@/lib/api/services/gamification-api'
import { formatDate } from '@/utils/format-utils'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { Award, Trophy, Star, GraduationCap, Heart, Target, Flame, Calendar, TrendingUp, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageLoading } from '@workspace/ui/components/page-loading'
import type { AchievementCategory } from '@workspace/schemas'

// Map achievement icons
const achievementIconMap: Record<string, any> = {
    Heart,
    Trophy,
    Star,
    GraduationCap,
    Award,
    Target,
    Flame,
    Calendar,
    TrendingUp,
    Zap,
}

// Category labels
const categoryLabels: Record<AchievementCategory, string> = {
    STREAK: 'Chuỗi học tập',
    CONSISTENCY: 'Kiên trì',
    LEARNING_PROGRESS: 'Tiến bộ học tập',
    RECOVERY: 'Phục hồi',
    SOCIAL: 'Xã hội',
    MASTERY: 'Thành thạo',
}

export default function AchievementsPage() {
    const { data: achievementsData, isLoading } = useAchievements()
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL')

    // Process achievements data
    const achievements = useMemo(() => {
        if (!achievementsData) return []
        return achievementsData.map((achievement) => {
            const iconName = achievement.achievement.icon ?? 'Award'
            const Icon = (iconName && iconName in achievementIconMap)
                ? achievementIconMap[iconName]
                : Award
            return {
                id: achievement.id,
                title: achievement.achievement.title,
                description: achievement.achievement.description,
                category: achievement.achievement.category,
                icon: Icon,
                earned: achievement.isUnlocked,
                date: achievement.unlockedAt ? formatDate(achievement.unlockedAt) : null,
                progress: achievement.progress,
            }
        })
    }, [achievementsData])

    // Filter by category
    const filteredAchievements = useMemo(() => {
        if (selectedCategory === 'ALL') return achievements
        return achievements.filter(a => a.category === selectedCategory)
    }, [achievements, selectedCategory])

    // Calculate stats
    const stats = useMemo(() => {
        const total = achievements.length
        const earned = achievements.filter(a => a.earned).length
        const percentage = total > 0 ? Math.round((earned / total) * 100) : 0
        return { total, earned, remaining: total - earned, percentage }
    }, [achievements])

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(achievements.map(a => a.category))
        return Array.from(cats) as AchievementCategory[]
    }, [achievements])

    if (isLoading) {
        return <PageLoading />
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-4 pb-2 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">
                    Thành tích của bạn
                </h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Khám phá và mở khóa các thành tích trong hành trình học tiếng Nhật của bạn.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="px-6 py-5 rounded-2xl border border-border bg-card shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Tổng cộng</p>
                    <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-blue-500" />
                        <span className="text-2xl font-bold text-foreground">{stats.total}</span>
                    </div>
                </div>
                <div className="px-6 py-5 rounded-2xl border border-border bg-card shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Đã đạt</p>
                    <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-amber-500" />
                        <span className="text-2xl font-bold text-foreground">{stats.earned}</span>
                    </div>
                </div>
                <div className="px-6 py-5 rounded-2xl border border-border bg-card shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Còn lại</p>
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-purple-500" />
                        <span className="text-2xl font-bold text-foreground">{stats.remaining}</span>
                    </div>
                </div>
                <div className="px-6 py-5 rounded-2xl border border-border bg-card shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Hoàn thành</p>
                    <div className="space-y-2">
                        <span className="text-2xl font-bold text-primary">{stats.percentage}%</span>
                        <Progress value={stats.percentage} className="h-1.5 bg-muted" />
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('ALL')}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all",
                        selectedCategory === 'ALL' ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"
                    )}
                >
                    Tất cả
                </Badge>
                {categories.map((category) => (
                    <Badge
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all",
                            selectedCategory === category ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"
                        )}
                    >
                        {categoryLabels[category]}
                    </Badge>
                ))}
            </div>

            {/* Achievements Grid */}
            {filteredAchievements.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAchievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={cn(
                                "p-6 rounded-2xl border transition-all shadow-sm",
                                achievement.earned
                                    ? "bg-card border-border hover:shadow-md"
                                    : "opacity-60 bg-muted/20 border-border/50 grayscale"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                    achievement.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                    <achievement.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-foreground leading-snug">
                                            {achievement.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {achievement.description}
                                        </p>
                                    </div>
                                    {achievement.earned && achievement.date && (
                                        <div className="pt-2 border-t border-border/50">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Đạt được: {achievement.date}
                                            </p>
                                        </div>
                                    )}
                                    {!achievement.earned && (
                                        <div className="pt-2">
                                            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide italic">
                                                Chưa mở khóa
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Empty>
                    <EmptyMedia>
                        <Trophy className="size-8 text-muted-foreground/40" />
                    </EmptyMedia>
                    <EmptyContent>
                        <EmptyTitle>
                            Không có thành tích nào
                        </EmptyTitle>
                        <EmptyDescription>
                            {selectedCategory === 'ALL'
                                ? 'Bắt đầu học tập để mở khóa thành tích đầu tiên!'
                                : 'Không có thành tích nào trong danh mục này'}
                        </EmptyDescription>
                    </EmptyContent>
                </Empty>
            )}
        </div>
    )
}
