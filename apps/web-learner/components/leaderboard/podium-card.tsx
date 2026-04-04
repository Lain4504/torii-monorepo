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
                'flex flex-col items-center gap-3 transition-all duration-500 md:gap-4 md:hover:-translate-y-2',
                /* Mobile: thứ tự 1 → 2 → 3; desktop: podium 2 | 1 | 3 */
                isFirst
                    ? 'order-1 z-10 md:order-2 md:mb-10 md:scale-110'
                    : isSecond
                      ? 'order-2 md:order-1'
                      : 'order-3 md:order-3',
            )}
        >
            <div className="relative">
                {isFirst && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 md:-top-8">
                        <Crown className="size-8 animate-bounce fill-amber-400 text-amber-400 drop-shadow-lg duration-3000 md:size-10" aria-hidden />
                    </div>
                )}

                <div
                    className={cn(
                        'rounded-full p-1.5',
                        isFirst
                            ? 'bg-warning shadow-md shadow-warning/20 md:shadow-lg'
                            : isSecond
                              ? 'bg-muted'
                              : 'bg-orange-100 dark:bg-orange-950',
                    )}
                >
                    <Avatar
                        className={cn(
                            'border-4 border-background',
                            isFirst ? 'size-[5.5rem] md:size-32' : 'size-20 md:size-24',
                        )}
                    >
                        <AvatarImage src={user.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-2xl font-black">
                            {user.displayName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div
                    className={cn(
                        'absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border-2 border-background text-xs font-black text-white',
                        isFirst ? 'size-9 bg-warning text-sm md:size-10 md:text-base' : 'size-8 bg-muted-foreground',
                        isThird && 'bg-orange-600',
                    )}
                >
                    {rank}
                </div>
            </div>

            <div className="mt-1 flex flex-col items-center text-center md:mt-2">
                <div className="flex max-w-[min(100%,16rem)] items-center justify-center gap-1.5">
                    <h3
                        className={cn(
                            'truncate font-black tracking-tight',
                            isFirst ? 'text-lg md:text-xl' : 'text-sm md:text-base',
                        )}
                        title={user.displayName}
                    >
                        {user.displayName}
                    </h3>
                    {isCurrentUser && (
                        <div className="size-2 rounded-full bg-primary" />
                    )}
                </div>
                <p className="text-xs font-bold text-muted-foreground md:text-sm">Cấp độ {user.level}</p>

                <div
                    className={cn(
                        'mt-2 flex items-center gap-1.5 self-center rounded-full border border-border/50 bg-background/50 px-3 py-1 backdrop-blur-sm md:mt-3 md:gap-2 md:px-4 md:py-1.5',
                        isFirst && 'border-warning/20 bg-warning/5 shadow-sm md:shadow-md',
                    )}
                >
                    {type === 'global' ? (
                        <Star className="size-4 fill-warning text-warning" />
                    ) : type === 'streak' ? (
                        <Flame className="size-4 fill-orange-500 text-orange-500" />
                    ) : (
                        <CalendarDays className="size-4 fill-primary text-primary" />
                    )}
                    <span className="font-extrabold text-base tabular-nums md:text-lg">
                        {type === 'global' 
                            ? formatNumber(user.xp) 
                            : type === 'streak' 
                                ? formatNumber(user.currentStreak ?? 0)
                                : formatNumber(user.totalActiveDays ?? 0)}
                    </span>
                    <span className="text-[10px] font-black uppercase text-muted-foreground">
                        {type === 'global' ? 'XP' : 'Ngày'}
                    </span>
                </div>
            </div>
        </div>
    )
}
