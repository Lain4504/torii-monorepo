'use client'

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Star, Flame, Trophy } from 'lucide-react'

interface LeaderboardHeaderProps {
    type: 'global' | 'streak' | 'active'
    onTypeChange: (type: 'global' | 'streak' | 'active') => void
}

export function LeaderboardHeader({ type, onTypeChange }: LeaderboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
            <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Bảng xếp hạng</h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Tôn vinh những học viên tích cực và có thành tích xuất sắc nhất trong cộng đồng Torii.
                </p>
            </div>

            <Tabs value={type} onValueChange={(v) => onTypeChange(v as any)} className="w-full md:w-auto">
                <TabsList className="bg-muted/50 p-1 rounded-lg border border-border/40 h-10 w-full md:w-auto">
                    <TabsTrigger value="global" className="px-6 h-full rounded-md text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Star className="size-3.5 mr-2 opacity-40" />
                        Toàn cầu
                    </TabsTrigger>
                    <TabsTrigger value="streak" className="px-6 h-full rounded-md text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Flame className="size-3.5 mr-2 opacity-40" />
                        Chuỗi học
                    </TabsTrigger>
                    <TabsTrigger value="active" className="px-6 h-full rounded-md text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Trophy className="size-3.5 mr-2 opacity-40" />
                        Năng nổ
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}
