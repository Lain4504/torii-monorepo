import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Trophy, Star, Target, Zap, Flame, Award } from "lucide-react";
import type { AchievementDTO } from "@workspace/schemas";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface AchievementsTableProps {
    data: AchievementDTO[];
    isLoading: boolean;
    onEdit: (achievement: AchievementDTO) => void;
    onDelete: (achievement: AchievementDTO) => void;
}

const iconMap: Record<string, any> = {
    Trophy,
    Star,
    Target,
    Zap,
    Flame,
    Award
};

export function AchievementsTable({ data, isLoading, onEdit, onDelete }: AchievementsTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Icon</TableHead>
                        <TableHead>Tên & Code</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Phân loại</TableHead>
                        <TableHead>Điều kiện</TableHead>
                        <TableHead>Phần thưởng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                Chưa có thành tích nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((achievement) => {
                            const Icon = iconMap[achievement.icon || 'Award'] || Award;
                            return (
                                <TableRow key={achievement.id}>
                                    <TableCell>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{achievement.title}</span>
                                            <span className="text-xs text-muted-foreground">{achievement.code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {achievement.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{achievement.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs italic">
                                            {(achievement.requirements as any)?.type}: {(achievement.requirements as any)?.value}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 font-bold text-amber-500">
                                            <Zap className="h-3 w-3" />
                                            {(achievement.rewards as any)?.points || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {achievement.isActive ? (
                                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Hoạt động</Badge>
                                        ) : (
                                            <Badge variant="secondary">Tạm dừng</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onEdit(achievement)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => onDelete(achievement)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
