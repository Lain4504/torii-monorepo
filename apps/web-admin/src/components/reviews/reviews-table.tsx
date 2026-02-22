
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { AlertCircle, Star, Eye } from 'lucide-react';
import { formatDateTime } from '@/lib/format-utils';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';

interface ReviewsTableProps {
    data: any[];
    isLoading: boolean;
    onView: (id: string) => void;
    page?: number;
    limit?: number;
}

export function ReviewsTable({ data, isLoading, onView, page = 1, limit = 10 }: ReviewsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-right">Chi tiết</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-[400px] text-center">
                            <Empty>
                                <EmptyMedia>
                                    <AlertCircle className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Không tìm thấy đánh giá</EmptyTitle>
                                    <EmptyDescription>Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn</EmptyDescription>
                                </EmptyContent>
                            </Empty>
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((review: any, index: number) => (
                        <TableRow key={review.id}>
                            <TableCell className="text-center font-medium text-muted-foreground/60">
                                {(page - 1) * limit + index + 1}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={review.user.avatarUrl} />
                                        <AvatarFallback>
                                            {review.user.displayName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{review.user.displayName}</span>
                                        <span className="text-xs text-muted-foreground">Học viên</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-foreground/80" title={review.courseTitle || review.courseId}>
                                    {review.courseTitle || review.courseId}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                                        />
                                    ))}
                                    <span className="ml-2 text-xs font-medium text-amber-600">{review.rating}.0</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-muted-foreground">
                                    {formatDateTime(review.createdAt)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onView(review.id)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
