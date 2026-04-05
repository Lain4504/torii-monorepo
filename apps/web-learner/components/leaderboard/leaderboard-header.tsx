'use client'

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Trophy, Star, Flame } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface LeaderboardHeaderProps {
    type: 'global' | 'streak' | 'active'
    onTypeChange: (type: 'global' | 'streak' | 'active') => void
}

const tabTriggerClass =
    'inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2 text-xs font-medium sm:py-1.5 sm:text-sm'

export function LeaderboardHeader({ type, onTypeChange }: LeaderboardHeaderProps) {
    return (
        <div className="mb-6 space-y-4 md:mb-10">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-normal text-foreground sm:text-3xl">
                    <Trophy className="size-7 shrink-0 text-amber-500 sm:size-8" aria-hidden />
                    Bảng xếp hạng
                </h1>
                <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-base">
                    Cùng nhau thi đua, cùng nhau tiến bộ.
                </p>
            </div>

            <div className="max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Tabs
                    value={type}
                    onValueChange={(v) => onTypeChange(v as 'global' | 'streak' | 'active')}
                    className="w-max max-w-full"
                >
                    <TabsList
                        className={cn(
                            'inline-flex h-auto min-h-10 w-max gap-0.5 rounded-xl border border-border/60 bg-muted/50 p-1',
                            'md:h-8 md:rounded-lg md:border-0 md:bg-muted',
                        )}
                    >
                        <TabsTrigger value="global" className={tabTriggerClass}>
                            <Star className="size-4 shrink-0" aria-hidden />
                            <span className="sm:hidden">XP</span>
                            <span className="hidden sm:inline">Toàn cầu (XP)</span>
                        </TabsTrigger>
                        <TabsTrigger value="streak" className={tabTriggerClass}>
                            <Flame className="size-4 shrink-0" aria-hidden />
                            <span className="sm:hidden">Streak</span>
                            <span className="hidden sm:inline">Chuỗi học</span>
                        </TabsTrigger>
                        <TabsTrigger value="active" className={tabTriggerClass}>
                            <Trophy className="size-4 shrink-0" aria-hidden />
                            <span className="sm:hidden">Ngày</span>
                            <span className="hidden sm:inline">Năng nổ</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    )
}
