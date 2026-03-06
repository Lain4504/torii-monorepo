'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Star, Flame } from 'lucide-react'
import type { LeaderboardUserDTO } from '@workspace/schemas'
import { formatNumber } from '@/utils/format-utils'

interface CurrentUserRankProps {
    user: LeaderboardUserDTO
    type: 'global' | 'streak'
}

export function CurrentUserRank({ user, type }: CurrentUserRankProps) {
    return (
        <Card className="mb-8 border-primary/30 bg-primary/5 shadow-md overflow-hidden animate-in slide-in-from-bottom duration-700">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl">
                        {user.rank}
                    </div>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={user.avatarUrl || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {user.displayName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-lg leading-none">Bạn (Thứ hạng hiện tại)</h3>
                            <p className="text-sm text-muted-foreground font-medium mt-1">{user.displayName}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cấp độ</p>
                        <p className="text-lg font-extrabold text-foreground">{user.level}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {type === 'global' ? 'Kinh Nghiệm' : 'Chuỗi học'}
                        </p>
                        <div className="flex items-center gap-1.5 justify-center">
                            {type === 'global' ? (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ) : (
                                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            )}
                            <p className="text-lg font-extrabold text-foreground">
                                {type === 'global' ? formatNumber(user.xp) : formatNumber(user.currentStreak ?? 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
