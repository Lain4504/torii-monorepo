'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Crown, Star, Flame } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { LeaderboardUserDto } from '@workspace/schemas'

interface PodiumCardProps {
    user: LeaderboardUserDto
    rank: number
    isCurrentUser: boolean
    type: 'global' | 'streak'
}

export function PodiumCard({ user, rank, isCurrentUser, type }: PodiumCardProps) {
    const isFirst = rank === 1
    const isSecond = rank === 2
    const isThird = rank === 3

    return (
        <div className={cn(
            "flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2",
            isFirst ? "order-2 md:mb-10 scale-110 z-10" : isSecond ? "order-1" : "order-3"
        )}>
            <div className="relative">
                {isFirst && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                        <Crown className="w-10 h-10 text-amber-400 fill-amber-400 drop-shadow-lg animate-bounce duration-3000" />
                    </div>
                )}

                <div className={cn(
                    "p-1.5 rounded-full",
                    isFirst ? "bg-gradient-to-tr from-amber-400 to-yellow-200" :
                        isSecond ? "bg-gradient-to-tr from-slate-400 to-slate-200" :
                            "bg-gradient-to-tr from-orange-400 to-orange-200"
                )}>
                    <Avatar className={cn(
                        "border-4 border-background",
                        isFirst ? "w-32 h-32" : "w-24 h-24"
                    )}>
                        <AvatarImage src={user.avatarUrl || ''} />
                        <AvatarFallback className="font-black text-2xl">
                            {user.displayName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-2 border-background font-black text-xs text-white",
                    isFirst ? "bg-amber-500 h-10 w-10 text-base" :
                        isSecond ? "bg-slate-500" :
                            "bg-orange-600"
                )}>
                    {rank}
                </div>
            </div>

            <div className="text-center mt-2 flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                    <h3 className={cn(
                        "font-black tracking-tight flex items-center gap-1",
                        isFirst ? "text-xl" : "text-base"
                    )}>
                        {user.displayName}
                    </h3>
                    {isCurrentUser && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                </div>
                <p className="text-sm font-bold text-muted-foreground">Cấp độ {user.level}</p>

                <div className={cn(
                    "mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm self-center",
                    isFirst && "shadow-lg border-amber-200 bg-amber-50/50"
                )}>
                    {type === 'global' ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    )}
                    <span className="font-extrabold text-lg tabular-nums">
                        {type === 'global' ? user.xp.toLocaleString() : (user.currentStreak ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black uppercase text-muted-foreground">{type === 'global' ? 'XP' : 'Ngày'}</span>
                </div>
            </div>
        </div>
    )
}
