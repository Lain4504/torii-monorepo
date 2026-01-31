
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
import { Loader2, AlertCircle, Star, Eye } from 'lucide-react';
import { formatDateTime } from '@/lib/format-utils';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';

interface ReviewsTableProps {
    data: any[];
    isLoading: boolean;
    onView: (id: string) => void;
}

export function ReviewsTable({ data, isLoading, onView }: ReviewsTableProps) {
    return (
        <div className="overflow-x-auto">
            <Table className="border-collapse min-w-[1000px] bg-transparent">
                <TableHeader className="bg-muted/30 border-b border-border">
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                        <TableHead className="w-[220px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/30 last:border-r-0">NGƯỜI DÙNG</TableHead>
                        <TableHead className="w-[250px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/30 last:border-r-0">KHÓA HỌC</TableHead>
                        <TableHead className="w-[140px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/30 last:border-r-0">ĐÁNH GIÁ</TableHead>
                        <TableHead className="w-[160px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/30 last:border-r-0">NGÀY</TableHead>
                        <TableHead className="w-[100px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 text-right border-r border-border/30 last:border-r-0">CHI TIẾT</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-[400px] text-center">
                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                                    <p className="text-xs font-semibold">Đang tải dữ liệu...</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-[400px] text-center">
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
                        data.map((review: any) => (
                            <TableRow key={review.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                                <TableCell className="py-4 px-6 border-r border-border/10 last:border-r-0">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 rounded-lg border border-border/40 bg-muted/20">
                                            <AvatarImage src={review.user.avatarUrl} />
                                            <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                                                {review.user.displayName.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors tracking-tight">{review.user.displayName}</span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40 italic">Học viên</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-border/10 last:border-r-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground/80 truncate max-w-[220px] font-sans italic" title={review.courseTitle || review.courseId}>
                                            {review.courseTitle || review.courseId}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-border/10 last:border-r-0">
                                    <div className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-amber-500/5 border border-amber-500/10 w-fit">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-2.5 h-2.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                                            />
                                        ))}
                                        <span className="ml-1.5 text-[10px] font-black text-amber-600/80 tabular-nums tracking-tighter">{review.rating}.0</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-border/10 last:border-r-0">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/40">
                                        {formatDateTime(review.createdAt)}
                                    </span>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right border-r border-border/10 last:border-r-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all"
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
        </div>
    );
}
