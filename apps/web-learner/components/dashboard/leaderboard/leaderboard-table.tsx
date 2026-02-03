'use client'

import { Card } from '@workspace/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Trophy, Star, Flame } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { LeaderboardUserDto } from '@workspace/schemas'
import { TrendIndicator } from './trend-indicator'

interface LeaderboardTableProps {
    users: LeaderboardUserDto[]
    currentUserId?: string
    type: 'global' | 'streak'
}

export function LeaderboardTable({ users, currentUserId, type }: LeaderboardTableProps) {
    return (
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden rounded-3xl">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-muted/30 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">Xếp hạng</div>
                <div className="col-span-6 md:col-span-8">Học viên</div>
                <div className="col-span-3 md:col-span-2 text-right">Thành tích</div>
                <div className="col-span-2 md:col-span-1 text-right">Xu hướng</div>
            </div>
            <div className="divide-y divide-border/50">
                {users.map((item, idx) => (
                    <div
                        key={item.id}
                        className={cn(
                            "grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-muted/50 transition-all duration-200 cursor-pointer group",
                            item.id === currentUserId && "bg-primary/5"
                        )}
                    >
                        <div className="col-span-1">
                            <div className="font-ex-bold text-xl text-muted-foreground/60 group-hover:text-foreground transition-colors">
                                {item.rank}
                            </div>
                        </div>
                        <div className="col-span-6 md:col-span-8">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border border-border group-hover:border-primary/50 transition-all">
                                        <AvatarImage src={item.avatarUrl || ''} />
                                        <AvatarFallback className="font-bold">
                                            {item.displayName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {item.id === currentUserId && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold group-hover:text-primary transition-colors">{item.displayName}</h4>
                                        {item.id === currentUserId && (
                                            <Badge variant="secondary" className="text-[10px] h-4 bg-primary/10 text-primary border-none">BẠN</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">Cấp độ {item.level}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 md:col-span-2 text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                                {type === 'global' ? (
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                ) : (
                                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                )}
                                <span className="font-bold text-lg tabular-nums">
                                    {type === 'global' ? item.xp.toLocaleString() : item.currentStreak}
                                </span>
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 flex justify-end">
                            <TrendIndicator change={Math.floor(Math.random() * 3) - 1} />
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="p-20 text-center">
                        <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Chưa có dữ liệu bảng xếp hạng.</p>
                    </div>
                )}
            </div>
        </Card>
    )
}
