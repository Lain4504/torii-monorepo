'use client'

import { useLeaderboard, useGamificationProfile } from '@/apis/services/gamification-api'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Trophy, Star, TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { cn } from '@workspace/ui/lib/utils'

export default function LeaderboardPage() {
    const { data: leaderboard, isLoading: isLeaderboardLoading } = useLeaderboard()
    const { data: profile, isLoading: isProfileLoading } = useGamificationProfile()

    if (isLeaderboardLoading || isProfileLoading) {
        return <PageLoading text="Đang tải bảng xếp hạng..." />
    }

    const currentUserId = profile?.userId

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-5xl animate-in fade-in duration-500">
            {/* Header section */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                    <Trophy className="w-3.5 h-3.5" />
                    Bảng xếp hạng tuần
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold italic tracking-tight text-foreground uppercase">
                    {profile?.league?.name || 'Bronze'} <span className="text-primary not-italic">League</span>
                </h1>
                <p className="text-sm text-muted-foreground/60 max-w-xl mx-auto italic">
                    Nỗ lực học tập để thăng hạng và nhận những phần quà hấp dẫn cuối tuần!
                </p>
            </div>

            {/* Top 3 Podium (Optional design, let's stick to list for Zen style) */}
            <div className="grid gap-4">
                {leaderboard?.map((entry, index) => {
                    const isCurrentUser = entry.id === currentUserId
                    const rank = index + 1

                    let RankIcon = null
                    if (rank === 1) RankIcon = <Medal className="w-6 h-6 text-amber-400" />
                    else if (rank === 2) RankIcon = <Medal className="w-5 h-5 text-slate-400" />
                    else if (rank === 3) RankIcon = <Medal className="w-5 h-5 text-amber-700" />

                    return (
                        <div
                            key={entry.id}
                            className={cn(
                                "flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-500 group",
                                isCurrentUser
                                    ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5 scale-[1.02] z-10"
                                    : "bg-background/40 backdrop-blur-xl border-border/40 hover:border-primary/20"
                            )}
                        >
                            {/* Rank number or icon */}
                            <div className="w-10 flex justify-center text-xl font-serif font-bold italic text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                                {RankIcon || rank}
                            </div>

                            {/* User Avatar */}
                            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                                <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                                <AvatarFallback className="bg-muted font-bold text-lg">
                                    {entry.displayName?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={cn(
                                    "text-lg font-serif font-bold italic truncate transition-colors",
                                    isCurrentUser ? "text-primary" : "text-foreground group-hover:text-primary/80"
                                )}>
                                    {entry.displayName || 'Học viên ẩn danh'}
                                    {isCurrentUser && <span className="ml-3 text-[10px] font-black uppercase not-italic tracking-widest opacity-40">(Bạn)</span>}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Đang hoạt động</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="text-right space-y-1">
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-2xl font-serif font-bold italic tracking-tighter">{entry.currentWeekXp}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">XP</span>
                                </div>
                                <div className="flex items-center justify-end gap-1.5">
                                    {rank <= 10 ? (
                                        <>
                                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-tighter">Thăng hạng</span>
                                        </>
                                    ) : rank > (leaderboard.length - 5) ? (
                                        <>
                                            <TrendingDown className="w-3 h-3 text-red-500" />
                                            <span className="text-[9px] font-bold text-red-500/60 uppercase tracking-tighter">Xuống hạng</span>
                                        </>
                                    ) : (
                                        <>
                                            <Minus className="w-3 h-3 text-muted-foreground/40" />
                                            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">Giữ hạng</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Empty state */}
            {leaderboard?.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-[3rem]">
                    <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground italic">Chưa có ai tham gia bảng xếp hạng tuần này.</p>
                </div>
            )}
        </div>
    )
}
