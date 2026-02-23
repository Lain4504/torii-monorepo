'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Crown, Star, Flame } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { LeaderboardUserDto } from '@workspace/schemas'
import { formatNumber } from '@/utils/format-utils'

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
            'flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2',
            isFirst ? 'order-2 z-10 scale-110 md:mb-10' : isSecond ? 'order-1' : 'order-3',
        )}>
            <div className="relative">
                {isFirst && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                        <Crown className="animate-bounce size-10 fill-amber-400 text-amber-400 drop-shadow-lg duration-3000" />
                    </div>
                )}

                <div className={cn(
                    'rounded-full p-1.5',
                    isFirst ? 'bg-warning shadow-lg shadow-warning/20' :
                        isSecond ? 'bg-muted' :
                            'bg-orange-100 dark:bg-orange-950',
                )}>
                    <Avatar className={cn(
                        'border-4 border-background',
                        isFirst ? 'size-32' : 'size-24',
                    )}>
                        <AvatarImage src={user.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-2xl font-black">
                            {user.displayName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className={cn(
                    'absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border-2 border-background text-xs font-black text-white',
                    isFirst ? 'size-10 bg-warning text-base' :
                        isSecond ? 'size-8 bg-muted-foreground' :
                            'size-8 bg-orange-600',
                )}>
                    {rank}
                </div>
            </div>

            <div className="mt-2 text-center flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                    <h3 className={cn(
                        'flex items-center gap-1 font-black tracking-tight',
                        isFirst ? 'text-xl' : 'text-base',
                    )}>
                        {user.displayName}
                    </h3>
                    {isCurrentUser && (
                        <div className="size-2 rounded-full bg-primary" />
                    )}
                </div>
                <p className="text-sm font-bold text-muted-foreground">Cấp độ {user.level}</p>

                <div className={cn(
                    'mt-3 flex items-center gap-2 self-center rounded-full border border-border/50 bg-background/50 px-4 py-1.5 backdrop-blur-sm',
                    isFirst && 'border-warning/20 bg-warning/5 shadow-md',
                )}>
                    {type === 'global'
                        ? <Star className="size-4 fill-warning text-warning" />
                        : <Flame className="size-4 fill-orange-500 text-orange-500" />}
                    <span className="font-extrabold text-lg tabular-nums">
                        {type === 'global' ? formatNumber(user.xp) : formatNumber(user.currentStreak ?? 0)}
                    </span>
                    <span className="text-[10px] font-black uppercase text-muted-foreground">{type === 'global' ? 'XP' : 'Ngày'}</span>
                </div>
            </div>
        </div>
    )
}
