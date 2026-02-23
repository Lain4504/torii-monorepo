
import { useState } from 'react';
import { useReviews, useReview } from '@/lib/api/services/reviews';
import { Button } from '@workspace/ui/components/button';
import { SmartPagination } from '@/components/common/smart-pagination';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { formatDateTime, formatNumber } from '@/lib/format-utils';
import { Star, Info } from 'lucide-react';
import { ReviewsPrimaryToolbar } from '@/components/reviews/reviews-primary-toolbar';
import { ReviewsTable } from '@/components/reviews/reviews-table';
import { PageHeader } from '@/components/common/page-header';
import {
    Empty,
    EmptyContent,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@workspace/ui/components/empty';
import { Spinner } from "@workspace/ui/components/spinner";
import { Card, CardContent } from "@workspace/ui/components/card";

export default function CourseReviewsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');

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

    const handleOpenChange = (open: boolean) => {
        setViewDialogOpen(open);
        if (!open) setSelectedReviewId(null);
    };

    const reviews = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Đánh giá Khóa học"
                subtitle="Quản lý phản hồi và xếp hạng học thuật Torii"
                stats={[
                    { label: "Tổng số đánh giá", value: formatNumber(data?.total) || 0 }
                ]}
            />

            <div className="space-y-4">
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

                <Card className="overflow-hidden">
                    <CardContent className="p-0">

                        <ReviewsTable
                            data={reviews as any}
                            isLoading={isLoading}
                            onView={openDetail}
                            page={page}
                            limit={10}
                        />

                    </CardContent>
                </Card>

                <SmartPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={data?.total || 0}
                    onPageChange={setPage}
                    itemName="đánh giá"
                />
            </div>

            {/* Detail View Dialog */}
            <Sheet open={viewDialogOpen} onOpenChange={handleOpenChange}>
                <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Chi tiết đánh giá</SheetTitle>
                        <SheetDescription>
                            Xem nội dung đầy đủ của đánh giá
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            {isLoadingDetail ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <Spinner className="h-8 w-8 text-primary/60" />
                                    <p className="text-xs text-muted-foreground">Đang tải thông tin...</p>
                                </div>
                            ) : reviewDetail ? (
                                <div className="space-y-4">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 rounded-lg border border-border/40">
                                            <AvatarImage src={reviewDetail.user.avatarUrl} />
                                            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                                {reviewDetail.user.displayName.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-sm text-foreground">{reviewDetail.user.displayName}</h3>
                                            <p className="text-xs text-muted-foreground">Học viên</p>
                                        </div>
                                    </div>

                                    {/* Course & Rating */}
                                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-0.5">Khóa học</p>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {reviewDetail.courseTitle || reviewDetail.courseId}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${i < reviewDetail.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(reviewDetail.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comment Content */}
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Nội dung đánh giá</p>
                                        <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                "{reviewDetail.comment || "Không có nội dung"}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Empty className="border-none">
                                    <EmptyMedia>
                                        <Info className="size-6 text-muted-foreground" />
                                    </EmptyMedia>
                                    <EmptyContent>
                                        <EmptyTitle>Không tìm thấy</EmptyTitle>
                                        <EmptyDescription>Không tìm thấy thông tin đánh giá.</EmptyDescription>
                                    </EmptyContent>
                                </Empty>
                            )}
                        </div>
                    </ScrollArea>

                    <SheetFooter>
                        <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                            Đóng
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
