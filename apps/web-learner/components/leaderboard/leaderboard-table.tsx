'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table'
import { Trophy, Star, Flame } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { LeaderboardUserDTO } from '@workspace/schemas'
import { TrendIndicator } from './trend-indicator'
import { formatNumber } from '@/utils/format-utils'

interface LeaderboardTableProps {
    users: LeaderboardUserDTO[]
    currentUserId?: string
    type: 'global' | 'streak'
}

export function LeaderboardTable({ users, currentUserId, type }: LeaderboardTableProps) {
    return (
        <Card className="border-border/50">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px] pl-8">Hạng</TableHead>
                            <TableHead>Học viên</TableHead>
                            <TableHead className="text-right">Thành tích</TableHead>
                            <TableHead className="w-[100px] text-right pr-8">Xu hướng</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((item) => (
                            <TableRow
                                key={item.id}
                                className={cn(
                                    "group cursor-pointer",
                                    item.id === currentUserId && "bg-primary/5 hover:bg-primary/10"
                                )}
                            >
                                <TableCell className="pl-8">
                                    <span className="text-lg font-black text-muted-foreground/60 group-hover:text-foreground transition-colors">
                                        {item.rank}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border border-border group-hover:border-primary/50 transition-all">
                                                <AvatarImage src={item.avatarUrl ?? undefined} />
                                                <AvatarFallback className="font-bold">
                                                    {item.displayName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {item.id === currentUserId && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold group-hover:text-primary transition-colors">
                                                    {item.displayName}
                                                </h4>
                                                {item.id === currentUserId && (
                                                    <Badge variant="secondary" className="text-[10px] h-4 bg-primary/10 text-primary border-none">
                                                        BẠN
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium">Cấp độ {item.level}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center gap-1.5 justify-end">
                                        {type === 'global' ? (
                                            <Star className="w-4 h-4 text-warning fill-warning" />
                                        ) : (
                                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                                        )}
                                        <span className="font-bold text-lg tabular-nums">
                                            {type === 'global' ? formatNumber(item.xp) : formatNumber(item.currentStreak ?? 0)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <TrendIndicator change={Math.floor(Math.random() * 3) - 1} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {users.length === 0 && (
                    <div className="p-20 text-center">
                        <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Chưa có dữ liệu bảng xếp hạng.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
