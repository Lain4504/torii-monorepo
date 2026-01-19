
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReviews, useDeleteReview } from '@/api/services/reviews';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Search, Loader2, Star, Trash2, Filter, AlertCircle, MessageSquare } from 'lucide-react';
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

export default function CourseReviewsPage() {
    const { t } = useTranslation(['admin', 'common']);
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
            toast.success(t('reviews.toasts.deleteSuccess', 'Review deleted successfully'));
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error(t('reviews.toasts.deleteError', 'Failed to delete review'));
        }
    };

    const confirmDelete = (review: any) => {
        setSelectedReview(review);
        setDeleteDialogOpen(true);
    };

    const reviews = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="flex flex-col min-h-screen space-y-6 pb-20 animate-in fade-in duration-500 px-0 sm:px-6">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <MessageSquare className="size-5" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('reviews.title', 'Course Reviews')}
                    </h1>
                </div>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    {t('reviews.description', 'Manage reviews and ratings from learners across all courses.')}
                </p>
            </div>

            {/* Action Bar */}
            <div className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-xl space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('reviews.searchPlaceholder', "Search reviews by user, course, or content...")}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9 h-10 w-full bg-background/60 border-border/40 focus:bg-background transition-all"
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
                            <SelectTrigger className="w-full md:w-[180px] h-10 bg-background/60 border-border/40">
                                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder={t('reviews.filterRating', "Filter by Rating")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('common.all', 'All Ratings')}</SelectItem>
                                <SelectItem value="5">5 {t('common.stars', 'Stars')}</SelectItem>
                                <SelectItem value="4">4 {t('common.stars', 'Stars')}</SelectItem>
                                <SelectItem value="3">3 {t('common.stars', 'Stars')}</SelectItem>
                                <SelectItem value="2">2 {t('common.stars', 'Stars')}</SelectItem>
                                <SelectItem value="1">1 {t('common.star', 'Star')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="rounded-2xl border border-border/40 bg-background/50 backdrop-blur-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[200px]">{t('reviews.table.user', 'User')}</TableHead>
                                <TableHead className="w-[250px]">{t('reviews.table.course', 'Course')}</TableHead>
                                <TableHead className="w-[120px]">{t('reviews.table.rating', 'Rating')}</TableHead>
                                <TableHead className="min-w-[300px]">{t('reviews.table.comment', 'Comment')}</TableHead>
                                <TableHead className="w-[150px]">{t('reviews.table.date', 'Date')}</TableHead>
                                <TableHead className="w-[80px] text-right">{t('common.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-[400px] text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                                            <p className="text-xs font-medium uppercase tracking-wider">{t('common.loading', 'Loading reviews...')}</p>
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
                                                <p className="text-lg font-medium text-foreground">{t('reviews.noReviews', 'No reviews found')}</p>
                                                <p className="text-sm">{t('reviews.tryAdjusting', 'Try adjusting your search or filters')}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reviews.map((review: any) => (
                                    <TableRow key={review.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-border/50">
                                                    <AvatarImage src={review.user.avatarUrl} />
                                                    <AvatarFallback className="text-xs bg-primary/5 text-primary">
                                                        {review.user.displayName.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-foreground">{review.user.displayName}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground font-medium truncate max-w-[200px]">
                                                    {review.courseTitle || review.courseId}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                                    />
                                                ))}
                                                <span className="ml-2 text-xs font-medium text-muted-foreground">{review.rating}.0</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-muted-foreground line-clamp-2 max-w-[400px]">
                                                {review.comment || <span className="italic opacity-50">{t('reviews.noComment', 'No written comment')}</span>}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-muted-foreground font-medium font-mono">
                                                {formatDateTime(review.createdAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
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

                {/* Pagination */}
                <div className="border-t border-border/10 bg-muted/5 p-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className="cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                />
                            </PaginationItem>

                            <div className="flex items-center gap-1 mx-2 text-sm font-medium text-muted-foreground">
                                <span>{t('common.page', 'Page')}</span>
                                <span className="text-foreground">{page}</span>
                                <span>{t('common.of', 'of')}</span>
                                <span className="text-foreground">{totalPages}</span>
                            </div>

                            <PaginationItem>
                                <PaginationNext
                                    className="cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('reviews.deleteTitle', 'Delete Review')}</DialogTitle>
                        <DialogDescription>
                            {t('reviews.deleteDescription', 'Are you sure you want to delete this review? This action cannot be undone.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedReview && (
                            <div className="rounded-xl bg-muted/30 p-4 border border-border/40">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < selectedReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">• by {selectedReview.user.displayName}</span>
                                </div>
                                <p className="text-sm italic text-muted-foreground">"{selectedReview.comment}"</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={createReviewMutation.isPending}>
                            {createReviewMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {t('common.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
