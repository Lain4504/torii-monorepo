'use client'

import { AchievementCard } from './achievement-card'
import { Trophy, Award, Zap, Star } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface AchievementListProps {
    achievements: any[]
}

export function AchievementList({ achievements }: AchievementListProps) {
    if (!achievements || achievements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-3xl border border-dashed border-muted-foreground/20 bg-muted/5">
                <div className="p-4 bg-muted rounded-full">
                    <Trophy className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold">Chưa có thành tích nào</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Học tập chăm chỉ để nhận được những huy hiệu danh giá đầu tiên nhé!
                    </p>
                </div>
            </div>
        )
    }

    // Grouping achievements by category for better organization
    const groups = [
        { title: 'Chuỗi học tập', category: 'STREAK', icon: Zap, color: 'text-orange-500' },
        { title: 'Tiến độ học tập', category: 'LEARNING_PROGRESS', icon: Award, color: 'text-blue-500' },
        { title: 'Thành thạo', category: 'MASTERY', icon: Star, color: 'text-purple-500' },
        { title: 'Tính kiên trì', category: 'CONSISTENCY', icon: Trophy, color: 'text-amber-500' },
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {groups.map((group) => {
                const groupAchievements = achievements.filter(
                    a => a.achievement.category === group.category
                )

                if (groupAchievements.length === 0) return null

                return (
                    <div key={group.category} className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={cn("p-1.5 rounded-lg bg-current/10", group.color)}>
                                <group.icon className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {group.title}
                            </h3>
                            <div className="h-px flex-1 bg-border/40 ml-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupAchievements.map((achievement) => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
