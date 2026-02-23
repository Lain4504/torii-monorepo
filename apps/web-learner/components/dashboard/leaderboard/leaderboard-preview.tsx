'use client'

import { Star, ArrowRight, Trophy } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import type { LeaderboardDto } from '@workspace/schemas'

interface LeaderboardPreviewProps {
    data?: LeaderboardDto
    isLoading?: boolean
}

export function LeaderboardPreview({ data, isLoading }: LeaderboardPreviewProps) {
    if (isLoading) {
        return (
            <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-sm animate-pulse">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 w-full bg-muted rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                        <Trophy className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Bảng xếp hạng</h3>
                </div>
                <Link href="/dashboard/leaderboard">
                    <div className="text-[10px] font-black text-primary hover:underline cursor-pointer flex items-center gap-1 uppercase tracking-wider">
                        Xem tất cả
                        <ArrowRight className="size-3" />
                    </div>
                </Link>
            </div>

            <div className="space-y-3">
                {data?.users?.slice(0, 5).map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className={cn(
                                "w-5 text-xs font-black text-center",
                                idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-600" : "text-muted-foreground/50"
                            )}>
                                {idx + 1}
                            </span>
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="size-7 rounded-full bg-muted border border-border overflow-hidden shrink-0">
                                    {item.avatarUrl ? (
                                        <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                            {item.displayName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                                    {item.displayName}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Star className="size-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-black tabular-nums">{item.xp}</span>
                        </div>
                    </div>
                ))}

                {data?.currentUser && data.currentUser.rank > 5 && (
                    <>
                        <div className="flex justify-center py-1">
                            <div className="size-1 rounded-full bg-border mx-0.5" />
                            <div className="size-1 rounded-full bg-border mx-0.5" />
                            <div className="size-1 rounded-full bg-border mx-0.5" />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-5 text-xs font-black text-center text-primary">
                                    {data.currentUser.rank}
                                </span>
                                <span className="text-xs font-bold truncate">Bạn</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                <Star className="size-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-black tabular-nums">{data.currentUser.xp}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
