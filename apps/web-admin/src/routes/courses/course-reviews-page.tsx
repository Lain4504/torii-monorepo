
import { useState } from 'react';
import { useReviews, useDeleteReview } from '@/api/services/reviews';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Search, Loader2, Star, Trash2, Filter, AlertCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@workspace/ui/components/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { formatDateTime } from '@/lib/format-utils';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

export default function CourseReviewsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');

    // Deletion state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);

    const { data, isLoading } = useReviews({
        page,
        limit: 10,
        search,
        rating: ratingFilter !== 'all' ? parseInt(ratingFilter) : undefined
    });

    const createReviewMutation = useDeleteReview();

    const handleDelete = async () => {
        if (!selectedReview) return;
        try {
            await createReviewMutation.mutateAsync(selectedReview.id);
            toast.success('Đã xóa đánh giá thành công');
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error('Xóa đánh giá thất bại');
        }
    };

    const confirmDelete = (review: any) => {
        setSelectedReview(review);
        setDeleteDialogOpen(true);
    };

    const reviews = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-4 max-w-2xl text-left">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-sans font-bold italic tracking-wide uppercase mb-1">
                        <Star className="size-3.5" />
                        Trung tâm Phản hồi
                    </div>
                    <h1 className="text-3xl md:text-4xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Đánh giá <span className="text-primary not-italic">Khóa học</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Quản lý phản hồi và Logic xếp hạng học thuật Torii
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end px-4 border-r border-border/40">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">Tổng số đánh giá</span>
                        <span className="text-2xl font-bold text-foreground tabular-nums">{data?.total?.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Toolbar */}
                <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Tìm kiếm theo người dùng, khóa học hoặc nội dung..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-9 h-11 w-full bg-background border-border hover:border-border/80 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select
                                value={ratingFilter}
                                onValueChange={(val) => {
                                    setRatingFilter(val);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[180px] h-11 bg-background border-border hover:border-border/80 rounded-xl focus:ring-primary/20 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground/70" />
                                        <SelectValue placeholder="Lọc theo Đánh Giá" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border rounded-xl shadow-lg">
                                    <SelectItem value="all" className="cursor-pointer py-2.5">
                                        <span className="font-medium">Tất Cả</span>
                                    </SelectItem>
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <SelectItem key={r} value={r.toString()} className="cursor-pointer py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {Array.from({ length: r }).map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium">{r} Sao</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="border-collapse min-w-[1000px]">
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-b border-border/50 hover:bg-transparent">
                                    <TableHead className="w-[220px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/50 last:border-r-0">NGƯỜI DÙNG</TableHead>
                                    <TableHead className="w-[250px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/50 last:border-r-0">KHÓA HỌC</TableHead>
                                    <TableHead className="w-[140px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/50 last:border-r-0">ĐÁNH GIÁ</TableHead>
                                    <TableHead className="min-w-[300px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/50 last:border-r-0">BÌNH LUẬN</TableHead>
                                    <TableHead className="w-[160px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 border-r border-border/50 last:border-r-0">NGÀY</TableHead>
                                    <TableHead className="w-[100px] h-12 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 text-right border-r border-border/50 last:border-r-0">THAO TÁC</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-[400px] text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                                                <p className="text-xs font-semibold">Đang tải dữ liệu...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : reviews.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-[400px] text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                                <div className="p-4 rounded-full bg-muted/30">
                                                    <AlertCircle className="h-8 w-8 opacity-50" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-base font-semibold text-foreground">Không tìm thấy đánh giá</p>
                                                    <p className="text-sm text-muted-foreground/70">Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reviews.map((review: any) => (
                                        <TableRow key={review.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                                            <TableCell className="py-4 px-6 border-r border-border/50 last:border-r-0">
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
                                            <TableCell className="py-4 px-6 border-r border-border/50 last:border-r-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-foreground/80 truncate max-w-[220px] font-sans italic" title={review.courseTitle || review.courseId}>
                                                        {review.courseTitle || review.courseId}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 border-r border-border/50 last:border-r-0">
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
                                            <TableCell className="py-4 px-6 border-r border-border/50 last:border-r-0">
                                                <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-2 max-w-[400px] italic font-medium">
                                                    {review.comment || <span className="italic opacity-30 text-xs font-normal">Chưa có nội dung bình luận...</span>}
                                                </p>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 border-r border-border/50 last:border-r-0">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/40">
                                                    {formatDateTime(review.createdAt)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-right border-r border-border/50 last:border-r-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                                                    onClick={() => confirmDelete(review)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination */}
                {((data?.total || 0) > 0 || isLoading) && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span>Hiển thị trang <span className="text-foreground">{page}</span> / {totalPages}</span>
                            <span className="mx-1 text-border">|</span>
                            <span>Tổng cộng <span className="text-foreground">{data?.total?.toLocaleString() || 0}</span> đánh giá</span>
                        </div>

                        {totalPages > 1 && (
                            <Pagination className="w-auto mx-0">
                                <PaginationContent className="flex items-center gap-1">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            className={cn(
                                                "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="hidden md:flex items-center px-4">
                                        <span className="text-xs text-muted-foreground">Trang {page}</span>
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            className={cn(
                                                "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                                page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="border border-border/50 shadow-2xl bg-background rounded-3xl p-0 overflow-hidden sm:max-w-[425px]">
                    <DialogHeader className="px-6 py-6 border-b border-border/10 bg-muted/5">
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Xóa Đánh Giá</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground/60 mt-1">
                            Hành động này sẽ xóa vĩnh viễn đánh giá này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-4">
                        {selectedReview && (
                            <div className="rounded-2xl bg-muted/30 p-4 border border-border/40 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={selectedReview.user.avatarUrl} />
                                        <AvatarFallback>{selectedReview.user.displayName.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <span className="text-xs font-bold text-foreground block">{selectedReview.user.displayName}</span>
                                        <div className="flex">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < selectedReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs italic text-muted-foreground pl-11">"{selectedReview.comment}"</p>
                            </div>
                        )}
                        <div className="rounded-xl bg-destructive/5 p-4 border border-destructive/10 flex gap-3 items-start">
                            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                            <p className="text-xs font-medium text-destructive/80 leading-relaxed">
                                Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="px-6 py-4 bg-background border-t border-border/10 gap-2">
                        <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl h-10 text-xs font-bold uppercase tracking-wider">
                            Hủy Bỏ
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={createReviewMutation.isPending} className="rounded-xl h-10 shadow-lg shadow-destructive/20 hover:shadow-destructive/30 hover:-translate-y-0.5 text-xs font-bold uppercase tracking-wider">
                            {createReviewMutation.isPending ? (
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                            )}
                            Xóa Ngay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
