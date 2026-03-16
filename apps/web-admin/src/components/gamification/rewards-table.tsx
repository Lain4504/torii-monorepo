import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Edit2, Trash2, Star, Ticket, Percent, Banknote } from "lucide-react"
import type { PointRewardDTO } from "@workspace/schemas"
import { formatCurrency, formatNumber } from "@/lib/format-utils"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@workspace/ui/components/empty"

interface RewardsTableProps {
    data: PointRewardDTO[]
    isLoading: boolean
    onEdit: (reward: PointRewardDTO) => void
    onDelete: (reward: PointRewardDTO) => void
}

export function RewardsTable({ data, isLoading, onEdit, onDelete }: RewardsTableProps) {
    if (isLoading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">STT</TableHead>
                        <TableHead>Tên phần thưởng</TableHead>
                        <TableHead>Số điểm cần</TableHead>
                        <TableHead>Loại giảm giá</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }

    if (data.length === 0) {
        return (
            <Empty className="py-20">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Ticket />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có mẫu phần thưởng</EmptyTitle>
                    <EmptyDescription>
                        Bắt đầu bằng cách tạo mẫu phần thưởng đầu tiên của bạn.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <Table>
           <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead className="w-[80px]">STT</TableHead>
                    <TableHead>Tên phần thưởng</TableHead>
                    <TableHead>Số điểm cần</TableHead>
                    <TableHead>Loại giảm giá</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((reward, index) => (
                    <TableRow key={reward.id}>
                        <TableCell className="font-medium text-muted-foreground">
                            {index + 1}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground">{reward.name}</span>
                                {reward.description && (
                                    <span className="text-xs text-muted-foreground line-clamp-1">{reward.description}</span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5 font-bold text-amber-600">
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                {formatNumber(reward.costPoints)}
                            </div>
                        </TableCell>
                        <TableCell>
                            {reward.config?.discountType === 'PERCENTAGE' ? (
                                <Badge variant="secondary" className="gap-1 font-normal">
                                    <Percent className="h-3 w-3" /> Phần trăm
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="gap-1 font-normal">
                                    <Banknote className="h-3 w-3" /> Số tiền cố định
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell className="font-medium">
                            {reward.config?.discountType === 'PERCENTAGE'
                                ? `${reward.config?.discountValue}%`
                                : formatCurrency(reward.config?.discountValue || 0)}
                        </TableCell>
                        <TableCell>
                            {reward.isActive ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">Hoạt động</Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground">Ẩn</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onEdit(reward)}
                                    title="Chỉnh sửa"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-destructive border-destructive/40 hover:text-destructive hover:bg-destructive/5"
                                    onClick={() => onDelete(reward)}
                                    title="Xóa"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
