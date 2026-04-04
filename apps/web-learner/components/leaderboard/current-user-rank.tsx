'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Star, Flame, CalendarDays } from 'lucide-react'
import type { LeaderboardUserDTO } from '@workspace/schemas'
import { formatNumber } from '@/utils/format-utils'

interface CurrentUserRankProps {
    user: LeaderboardUserDTO
    type: 'global' | 'streak' | 'active'
}

export function CurrentUserRank({ user, type }: CurrentUserRankProps) {
    return (
        <Card className="mb-6 overflow-hidden border-primary/30 bg-primary/5 shadow-md animate-in slide-in-from-bottom duration-700 md:mb-8">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary sm:size-12 sm:text-xl">
                        {user.rank}
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-11 shrink-0 border-2 border-primary sm:h-12 sm:w-12">
                            <AvatarImage src={user.avatarUrl || ''} />
                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                {user.displayName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold leading-tight sm:text-base md:text-lg">
                                Bạn · Thứ hạng hiện tại
                            </h3>
                            <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground sm:text-sm">
                                {user.displayName}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-stretch justify-between gap-3 border-t border-primary/10 pt-3 sm:border-t-0 sm:pt-0 md:gap-6">
                    <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-background/40 px-3 py-2 text-center sm:flex-initial sm:bg-transparent sm:px-0 sm:py-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
                            Cấp độ
                        </p>
                        <p className="text-base font-extrabold text-foreground sm:text-lg">{user.level}</p>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-background/40 px-3 py-2 text-center sm:flex-initial sm:bg-transparent sm:px-0 sm:py-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
                            {type === 'global' ? 'Kinh nghiệm' : type === 'streak' ? 'Chuỗi học' : 'Hoạt động'}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                            {type === 'global' ? (
                                <Star className="size-4 shrink-0 fill-amber-500 text-amber-500" aria-hidden />
                            ) : type === 'streak' ? (
                                <Flame className="size-4 shrink-0 fill-orange-500 text-orange-500" aria-hidden />
                            ) : (
                                <CalendarDays className="size-4 shrink-0 fill-primary text-primary" aria-hidden />
                            )}
                            <p className="text-base font-extrabold tabular-nums text-foreground sm:text-lg">
                                {type === 'global'
                                    ? formatNumber(user.xp)
                                    : type === 'streak'
                                      ? formatNumber(user.currentStreak ?? 0)
                                      : formatNumber(user.totalActiveDays ?? 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
