'use client'

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Trophy, Star, Flame } from 'lucide-react'

interface LeaderboardHeaderProps {
    type: 'global' | 'streak'
    onTypeChange: (type: 'global' | 'streak') => void
}

export function LeaderboardHeader({ type, onTypeChange }: LeaderboardHeaderProps) {
    return (
<div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
                    <Trophy className="h-8 w-8 text-amber-500" />
                    Bảng Xếp Hạng
                </h1>
                <p className="mt-1 font-medium text-muted-foreground">
                    Cùng nhau thi đua, cùng nhau tiến bộ!
                </p>
            </div>

            <Tabs value={type} onValueChange={(v) => onTypeChange(v as any)} className="w-full md:w-auto">
                <TabsList className="grid h-11 w-full grid-cols-2 border-border/50 premium-glass lg:w-[400px]">
                    <TabsTrigger value="global" className="font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Star className="mr-2 h-4 w-4" />
                        Toàn cầu (XP)
                    </TabsTrigger>
                    <TabsTrigger value="streak" className="font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Flame className="mr-2 h-4 w-4" />
                        Chuỗi học (Streak)
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}
