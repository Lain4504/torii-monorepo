'use client'

import { useAchievements } from '@/apis/services/gamification-api'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'
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
                date: achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString('vi-VN') : null,
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-primary/40 rounded-full" />
                    <h1 className="text-3xl md:text-4xl font-sans font-bold italic text-foreground uppercase tracking-tight">
                        Thành tích của bạn
                    </h1>
                </div>
                <p className="text-sm text-muted-foreground/60 italic pl-4 border-l-2 border-primary/10">
                    Khám phá và mở khóa các thành tích trong hành trình học tiếng Nhật của bạn
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="px-6 py-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm">
                    <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mb-1">Tổng cộng</p>
                    <div className="flex items-center gap-3">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        <span className="text-xl font-sans font-bold italic text-foreground">{stats.total}</span>
                    </div>
                </div>
                <div className="px-6 py-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm">
                    <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mb-1">Đã đạt</p>
                    <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-xl font-sans font-bold italic text-foreground">{stats.earned}</span>
                    </div>
                </div>
                <div className="px-6 py-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm">
                    <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mb-1">Còn lại</p>
                    <div className="flex items-center gap-3">
                        <Target className="w-4 h-4 text-purple-500" />
                        <span className="text-xl font-sans font-bold italic text-foreground">{stats.remaining}</span>
                    </div>
                </div>
                <div className="px-6 py-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm">
                    <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mb-1">Hoàn thành</p>
                    <div className="space-y-2">
                        <span className="text-xl font-sans font-bold italic text-primary">{stats.percentage}%</span>
                        <Progress value={stats.percentage} className="h-1 bg-primary/5" />
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('ALL')}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all",
                        selectedCategory === 'ALL' ? "bg-primary text-white" : "hover:bg-primary/5"
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
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all",
                            selectedCategory === category ? "bg-primary text-white" : "hover:bg-primary/5"
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
                                    ? "bg-card/40 backdrop-blur-md border-border/40 hover:shadow-lg hover:border-primary/20"
                                    : "opacity-40 grayscale bg-transparent border-border/20"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                                    achievement.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                    <achievement.icon className="w-7 h-7" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-sans font-bold italic text-foreground">
                                            {achievement.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground/70 leading-relaxed">
                                            {achievement.description}
                                        </p>
                                    </div>
                                    {achievement.earned && achievement.date && (
                                        <div className="pt-2 border-t border-border/10">
                                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                Đạt được: {achievement.date}
                                            </p>
                                        </div>
                                    )}
                                    {!achievement.earned && (
                                        <div className="pt-2">
                                            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">
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
                <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-sans font-bold italic text-foreground">
                            Không có thành tích nào
                        </h3>
                        <p className="text-sm text-muted-foreground/60">
                            {selectedCategory === 'ALL'
                                ? 'Bắt đầu học tập để mở khóa thành tích đầu tiên!'
                                : 'Không có thành tích nào trong danh mục này'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
