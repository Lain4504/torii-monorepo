'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Crown, Star, Flame, CalendarDays } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { LeaderboardUserDTO } from '@workspace/schemas'
import { formatNumber } from '@/utils/format-utils'

interface PodiumCardProps {
    user: LeaderboardUserDTO
    rank: number
    isCurrentUser: boolean
    type: 'global' | 'streak' | 'active'
}

export function PodiumCard({ user, rank, isCurrentUser, type }: PodiumCardProps) {
    const isFirst = rank === 1
    const isSecond = rank === 2
    const isThird = rank === 3

    return (
        <div
            className={cn(
                'flex flex-col items-center gap-6 transition-all duration-700',
                isFirst
                    ? 'order-2 z-10 md:mb-14 px-4'
                    : isSecond
                      ? 'order-1'
                      : 'order-3',
            )}
        >
            <div className="relative group">
                {isFirst && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                        <Crown className="size-8 text-primary/20 transition-colors group-hover:text-primary/40" />
                    </div>
                )}

                <div
                    className={cn(
                        'rounded-full p-1.5 transition-all duration-500 ring-1',
                        isFirst
                            ? 'bg-amber-400/10 ring-amber-400/40 scale-110 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                            : isSecond
                                ? 'bg-slate-400/10 ring-slate-400/40'
                                : isThird
                                    ? 'bg-orange-500/10 ring-orange-500/40'
                                    : 'bg-muted/10 ring-border/40',
                    )}
                >
                    <Avatar
                        className={cn(
                            'border-4 border-background shadow-none relative ring-1',
                            isFirst 
                                ? 'size-24 md:size-36 ring-amber-400/20' 
                                : isSecond 
                                    ? 'size-16 md:size-24 ring-slate-400/20'
                                    : 'size-16 md:size-24 ring-orange-500/20',
                        )}
                    >
                        <AvatarImage src={user.avatarUrl ?? undefined} className="group-hover:scale-105 transition-transform duration-700" />
                        <AvatarFallback className="text-xl font-semibold text-muted-foreground/30">
                            {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div
                    className={cn(
                        'absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-lg border shadow-none font-bold tabular-nums ring-4 ring-background transition-all',
                        isFirst 
                            ? 'size-9 bg-amber-400 text-white border-amber-500 text-sm' 
                            : isSecond
                                ? 'size-7 bg-slate-400 text-white border-slate-500 text-[10px]'
                                : 'size-7 bg-orange-500 text-white border-orange-600 text-[10px]',
                    )}
                >
                    {rank}
                </div>
            </div>

            <div className="flex flex-col items-center text-center w-full px-1 space-y-3">
                <div className="space-y-1">
                    <div className="flex w-full items-center justify-center gap-1.5 min-w-0">
                        <h3
                            className={cn(
                                'truncate font-bold tracking-tight text-foreground/80',
                                isFirst ? 'text-sm md:text-xl' : 'text-xs md:text-sm',
                            )}
                            title={user.displayName}
                        >
                            {user.displayName}
                        </h3>
                        {isCurrentUser && (
                            <div className="size-2 shrink-0 rounded-full bg-primary/40 ring-4 ring-primary/10" title="YOU" />
                        )}
                    </div>
                    <p className="text-[10px] font-semibold text-muted-foreground/40 leading-none">Cấp {user.level}</p>
                </div>

                <div
                    className={cn(
                        'flex items-center gap-2 rounded-xl border border-border/40 bg-zinc-50/10 px-4 py-1.5 transition-colors',
                        isFirst && 'border-primary/20 bg-primary/[0.02]',
                    )}
                >
                    {type === 'global' ? (
                        <Star className="size-3.5 text-amber-500/30" />
                    ) : type === 'streak' ? (
                        <Flame className="size-3.5 text-orange-500/30" />
                    ) : (
                        <CalendarDays className="size-3.5 text-primary/30" />
                    )}
                    <span className={cn(
                        "font-bold tabular-nums tracking-tight",
                        isFirst ? "text-lg text-primary/70" : "text-sm text-foreground/60"
                    )}>
                        {type === 'global' 
                            ? formatNumber(user.xp) 
                            : type === 'streak' 
                                ? formatNumber(user.currentStreak ?? 0)
                                : formatNumber(user.totalActiveDays ?? 0)}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground/40">
                        {type === 'global' ? 'XP' : type === 'streak' ? 'Ngày' : 'Ngày'}
                    </span>
                </div>
            </div>
        </div>
    )
}
