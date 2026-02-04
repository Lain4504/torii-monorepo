'use client'

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Trophy, Star, Flame } from 'lucide-react'

interface LeaderboardHeaderProps {
    type: 'global' | 'streak'
    onTypeChange: (type: 'global' | 'streak') => void
}

export function LeaderboardHeader({ type, onTypeChange }: LeaderboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Trophy className="w-8 h-8 text-amber-500" />
                    Bảng Xếp Hạng
                </h1>
                <p className="text-muted-foreground mt-1 font-medium">
                    Cùng nhau thi đua, cùng nhau tiến bộ!
                </p>
            </div>

            <Tabs value={type} onValueChange={(v) => onTypeChange(v as any)} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px] h-11 premium-glass border-border/50">
                    <TabsTrigger value="global" className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <Star className="w-4 h-4 mr-2" />
                        Toàn cầu (XP)
                    </TabsTrigger>
                    <TabsTrigger value="streak" className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <Flame className="w-4 h-4 mr-2" />
                        Chuỗi học (Streak)
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}
