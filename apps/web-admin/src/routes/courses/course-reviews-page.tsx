
import { useState } from 'react';
import { useReviews, useReview } from '@/api/services/reviews';
import { Button } from '@workspace/ui/components/button';

import { SmartPagination } from '@/components/common/smart-pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { formatDateTime } from '@/lib/format-utils';
import { Loader2, Star, AlertCircle } from 'lucide-react';
import { ReviewsPrimaryToolbar } from '@/components/reviews/reviews-primary-toolbar';
import { ReviewsTable } from '@/components/reviews/reviews-table';


export default function CourseReviewsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');

    // Detail View State
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

    const { data, isLoading } = useReviews({
        page,
        limit: 10,
        search,
        rating: ratingFilter !== 'all' ? parseInt(ratingFilter) : undefined
    });

    const { data: reviewDetail, isLoading: isLoadingDetail } = useReview(selectedReviewId);

    const openDetail = (id: string) => {
        setSelectedReviewId(id);
        setViewDialogOpen(true);
    };

    // Reset selected ID when dialog closes to ensuring refetch on next open if needed (though react-query caches)
    const handleOpenChange = (open: boolean) => {
        setViewDialogOpen(open);
        if (!open) setSelectedReviewId(null);
    };

    const reviews = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Đánh giá Khóa học</h1>
                    <p className="text-sm text-muted-foreground">
                        Quản lý phản hồi và xếp hạng học thuật Torii
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end px-4 border-r border-border/40">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Tổng số đánh giá</span>
                        <span className="text-2xl font-bold text-foreground tabular-nums">{data?.total?.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Toolbar */}
                <ReviewsPrimaryToolbar
                    search={search}
                    onSearchChange={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                    ratingFilter={ratingFilter}
                    onRatingFilterChange={(val) => {
                        setRatingFilter(val);
                        setPage(1);
                    }}
                />

                {/* Table Section */}
                <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
                    <ReviewsTable
                        data={reviews}
                        isLoading={isLoading}
                        onView={openDetail}
                    />

                    {/* Pagination */}
                    <SmartPagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={data?.total || 0}
                        onPageChange={setPage}
                        itemName="đánh giá"
                        className="border-t border-border/10 px-6 py-4"
                    />
                </div>
            </div>

            {/* Detail View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="border border-border/50 shadow-2xl bg-background rounded-3xl p-0 overflow-hidden sm:max-w-[500px]">
                    <DialogHeader className="px-6 py-6 border-b border-border/10 bg-muted/5">
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Chi Tiết Đánh Giá</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground/60 mt-1">
                            Xem nội dung đầy đủ của đánh giá
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6">
                        {isLoadingDetail ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                                <p className="text-xs text-muted-foreground">Đang tải thông tin...</p>
                            </div>
                        ) : reviewDetail ? (
                            <div className="space-y-6">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 rounded-xl border border-border/40 bg-muted/20">
                                        <AvatarImage src={reviewDetail.user.avatarUrl} />
                                        <AvatarFallback className="text-sm font-black bg-primary/10 text-primary">
                                            {reviewDetail.user.displayName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">{reviewDetail.user.displayName}</h3>
                                        <p className="text-xs font-medium text-muted-foreground italic">Học viên</p>
                                    </div>
                                </div>

                                {/* Course & Rating */}
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/50 mb-1">Khóa học</p>
                                            <p className="text-sm font-semibold text-foreground italic">
                                                {reviewDetail.courseTitle || reviewDetail.courseId}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex bg-background rounded-full px-2 py-1 border border-border/50 shadow-sm">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < reviewDetail.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground mt-1">
                                                {formatDateTime(reviewDetail.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comment Content */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/50 mb-2">Nội dung đánh giá</p>
                                    <div className="bg-background rounded-xl p-4 border border-border/50 shadow-sm">
                                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                                            "{reviewDetail.comment || "Không có nội dung"}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>Không tìm thấy thông tin đánh giá</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="px-6 py-4 bg-background border-t border-border/10">
                        <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="w-full rounded-xl h-10 text-xs font-bold uppercase tracking-wider">
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
