'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table'
import { Trophy, Star, Flame, CalendarDays } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { LeaderboardUserDTO } from '@workspace/schemas'
import { TrendIndicator } from './trend-indicator'
import { formatNumber } from '@/utils/format-utils'

interface LeaderboardTableProps {
    users: LeaderboardUserDTO[]
    currentUserId?: string
    type: 'global' | 'streak' | 'active'
}

function StatIcon({ type }: { type: 'global' | 'streak' | 'active' }) {
    if (type === 'global') {
        return <Star className="size-4 shrink-0 fill-amber-500 text-amber-500" aria-hidden />
    }
    if (type === 'streak') {
        return <Flame className="size-4 shrink-0 fill-orange-500 text-orange-500" aria-hidden />
    }
    return <CalendarDays className="size-4 shrink-0 fill-primary/20 text-primary" aria-hidden />
}

function formatStat(item: LeaderboardUserDTO, type: 'global' | 'streak' | 'active') {
    if (type === 'global') return formatNumber(item.xp)
    if (type === 'streak') return formatNumber(item.currentStreak ?? 0)
    return formatNumber(item.totalActiveDays ?? 0)
}

export function LeaderboardTable({ users, currentUserId, type }: LeaderboardTableProps) {
    return (
        <Card className="border-border/50">
            <CardContent className="p-0">
                {users.length === 0 ? (
                    <div className="px-4 py-12 text-center sm:py-16 md:py-20">
                        <Trophy className="mx-auto mb-3 size-12 text-muted-foreground/25 sm:mb-4 sm:size-16" aria-hidden />
                        <p className="text-sm font-medium text-muted-foreground sm:text-base">
                            Chưa có dữ liệu bảng xếp hạng.
                        </p>
                    </div>
                ) : (
                    <>
                        <ul className="divide-y divide-border md:hidden" aria-label="Danh sách xếp hạng">
                            {users.map((item) => {
                                const isMe = item.id === currentUserId
                                return (
                                    <li
                                        key={item.id}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-3.5',
                                            isMe && 'bg-primary/[0.06]',
                                        )}
                                    >
                                        <span className="w-7 shrink-0 text-center text-base font-black tabular-nums text-muted-foreground">
                                            {item.rank}
                                        </span>
                                        <div className="relative shrink-0">
                                            <Avatar className="size-10 border border-border">
                                                <AvatarImage src={item.avatarUrl ?? undefined} />
                                                <AvatarFallback className="text-sm font-bold">
                                                    {item.displayName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isMe && (
                                                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-primary" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <h4 className="truncate font-bold leading-tight">{item.displayName}</h4>
                                                {isMe && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-4 shrink-0 border-none bg-primary/10 px-1.5 text-[9px] text-primary"
                                                    >
                                                        Bạn
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground">Cấp {item.level}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <div className="flex items-center gap-1">
                                                <StatIcon type={type} />
                                                <span className="text-base font-bold tabular-nums">
                                                    {formatStat(item, type)}
                                                </span>
                                            </div>
                                            <TrendIndicator change={Math.floor(Math.random() * 3) - 1} />
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        <div className="hidden overflow-x-auto md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[72px] pl-6 lg:pl-8">Hạng</TableHead>
                                        <TableHead>Học viên</TableHead>
                                        <TableHead className="text-right">Thành tích</TableHead>
                                        <TableHead className="w-[88px] pr-6 text-right lg:pr-8">Xu hướng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className={cn(
                                                'group',
                                                item.id === currentUserId && 'bg-primary/5 hover:bg-primary/10',
                                            )}
                                        >
                                            <TableCell className="pl-6 lg:pl-8">
                                                <span className="text-lg font-black text-muted-foreground/60 transition-colors group-hover:text-foreground">
                                                    {item.rank}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3 lg:gap-4">
                                                    <div className="relative">
                                                        <Avatar className="size-10 border border-border transition-all group-hover:border-primary/50">
                                                            <AvatarImage src={item.avatarUrl ?? undefined} />
                                                            <AvatarFallback className="font-bold">
                                                                {item.displayName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {item.id === currentUserId && (
                                                            <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-background bg-primary" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="font-bold transition-colors group-hover:text-primary">
                                                                {item.displayName}
                                                            </h4>
                                                            {item.id === currentUserId && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="h-4 border-none bg-primary/10 text-[10px] text-primary"
                                                                >
                                                                    BẠN
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-medium text-muted-foreground">
                                                            Cấp độ {item.level}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <StatIcon type={type} />
                                                    <span className="text-lg font-bold tabular-nums">
                                                        {formatStat(item, type)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right lg:pr-8">
                                                <TrendIndicator change={Math.floor(Math.random() * 3) - 1} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
