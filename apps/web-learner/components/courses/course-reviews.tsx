'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Star, ThumbsUp, MessageSquare, Plus, Search, ChevronRight, X, Sparkles } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import type { CourseResponseDTO } from '@workspace/schemas'
import { reviewApi, type ReviewResponse, type RatingDistribution } from '@/lib/api/services/review-api'
import { useAppSelector } from '@/hooks/hooks'
import { useCourseEnrollment } from '@/hooks/use-course-enrollment'
import { Field, FieldLabel } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { cn } from '@workspace/ui/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

interface CourseReviewsProps {
    course: CourseResponseDTO
}

export function CourseReviews({ course }: CourseReviewsProps) {
    const [reviews, setReviews] = useState<ReviewResponse[]>([])
    const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [showAllReviews, setShowAllReviews] = useState(false)
    const [newRating, setNewRating] = useState(0)
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const user = useAppSelector((state) => state.auth.user)

    const { isEnrolled, isLoadingEnrollment } = useCourseEnrollment(course.id, course.slug)
    const userReview = reviews.find((r) => r.userId === user?.id)

    useEffect(() => {
        loadReviews()
        loadRatingDistribution()
    }, [course.id, page])

    const loadReviews = async () => {
        try {
            setLoading(true)
            const response = await reviewApi.getReviewsByCourse(course.id, page, 10)
            if (page === 1) {
                setReviews(response?.data || [])
            } else {
                setReviews((prev) => [...prev, ...(response?.data || [])])
            }
            setHasMore((response?.page || 1) < (response?.totalPages || 0))
        } catch (error: any) {
            console.error('Failed to load reviews:', error)
            toast.error('Không thể tải đánh giá')
        } finally {
            setLoading(false)
        }
    }

    const loadRatingDistribution = async () => {
        try {
            const distribution = await reviewApi.getRatingDistribution(course.id)
            setRatingDistribution(distribution)
        } catch (error: any) {
            console.error('Failed to load rating distribution:', error)
        }
    }

    const queryClient = useQueryClient()

    const handleSubmitReview = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đánh giá')
            return
        }

        if (newRating === 0) {
            toast.error('Vui lòng chọn số sao')
            return
        }

        try {
            setSubmitting(true)
            const newReview = await reviewApi.createReview(course.id, {
                rating: newRating,
                comment: newComment || undefined,
            })
            setReviews((prev) => [newReview, ...prev])
            setShowReviewForm(false)
            setNewRating(0)
            setNewComment('')
            toast.success('Đánh giá của bạn đã được gửi')

            // Invalidate queries to refresh data across the app
            queryClient.invalidateQueries({ queryKey: ['home-reviews'] })

            await loadRatingDistribution()
        } catch (error: any) {
            console.error('Failed to submit review:', error)
            toast.error(error?.response?.data?.message || 'Không thể gửi đánh giá')
        } finally {
            setSubmitting(false)
        }
    }

    const renderStars = (rating: number, interactive: boolean = false, size: number = 4) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        className={cn(
                            `w-${size} h-${size}`,
                            i <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/20',
                            interactive && 'cursor-pointer hover:scale-110 transition-transform hover:text-amber-400'
                        )}
                        onClick={() => interactive && setNewRating(i)}
                    />
                ))}
            </div>
        )
    }

    const ReviewItem = ({ review }: { review: ReviewResponse }) => (
        <div className="p-6 rounded-2xl bg-card border border-border hover:border-border/80 transition-colors">
            <div className="flex gap-4">
                <Avatar className="h-10 w-10 rounded-xl border border-border shadow-sm shrink-0">
                    <AvatarImage src={review.user.avatarUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {review.user.displayName ? review.user.displayName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-foreground">
                                {review.user.displayName}
                            </h4>
                            <div className="flex items-center gap-2">
                                {renderStars(review.rating, false, 3)}
                                <span className="text-xs text-muted-foreground font-medium">
                                    Đã xác thực
                                </span>
                            </div>
                        </div>
                    </div>

                    {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            "{review.comment}"
                        </p>
                    )}

                    <div className="flex items-center gap-4 pt-1">
                        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Hữu ích</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    const averageRating = ratingDistribution?.averageRating || Number(course.averageRating) || 0
    const totalReviews = ratingDistribution?.totalReviews || course.totalReviews || 0
    const roundedRating = Math.round(averageRating * 10) / 10

    const distribution = ratingDistribution?.distribution || [
        { stars: 5, count: 0, percent: 0 },
        { stars: 4, count: 0, percent: 0 },
        { stars: 3, count: 0, percent: 0 },
        { stars: 2, count: 0, percent: 0 },
        { stars: 1, count: 0, percent: 0 },
    ]

    const RatingBreakdown = () => (
        <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
                const stat = distribution.find(d => d.stars === star) || { stars: star, count: 0, percent: 0 }
                return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 w-8">
                            <span className="font-bold text-foreground">{star}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${stat.percent}%` }}
                            />
                        </div>
                        <div className="w-10 text-right">
                            <span className="text-xs text-muted-foreground">{stat.percent}%</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )

    if (loading && page === 1) {
        return (
            <div className="py-24 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center animate-pulse">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Đang tải đánh giá...</span>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700" id="reviews">
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Cảm nhận học viên</h2>
            </div>

            <div>
                <div className="space-y-10">
                    {/* Review Summary */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16">
                        <div className="flex flex-col items-center lg:items-start gap-2">
                            <span className="text-6xl font-bold text-foreground tracking-tight">
                                {roundedRating}
                            </span>
                            <div className="space-y-1 text-center lg:text-left">
                                <div className="flex justify-center lg:justify-start">
                                    {renderStars(averageRating, false, 5)}
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">Điểm đánh giá trung bình</div>
                                <div className="text-sm font-bold text-foreground">{totalReviews} học viên đã tham gia</div>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md w-full mx-auto lg:mx-0">
                            <RatingBreakdown />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 pt-8 border-t border-border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {isAuthenticated && (
                                <>
                                    {isLoadingEnrollment ? (
                                        <div className="h-11 w-32 bg-muted animate-pulse rounded-xl" />
                                    ) : isEnrolled ? (
                                        !userReview && (
                                            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                                                <DialogTrigger asChild>
                                                    <Button className="w-full md:w-auto h-11 px-6 rounded-xl font-bold">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Viết đánh giá
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-lg rounded-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl font-bold">Đánh giá khóa học</DialogTitle>
                                                        <DialogDescription>
                                                            Chia sẻ trải nghiệm của bạn để giúp đỡ các học viên khác.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-6 py-4">
                                                        <Field className="flex flex-col items-center gap-4">
                                                            <FieldLabel className="text-muted-foreground">Mức độ hài lòng của bạn</FieldLabel>
                                                            <div className="flex gap-2">
                                                                {renderStars(newRating, true, 8)}
                                                            </div>
                                                            <span className="text-sm font-medium text-primary h-5">
                                                                {newRating > 0 ? ['Rất kém', 'Cần cải thiện', 'Tốt', 'Rất tốt', 'Tuyệt vời'][newRating - 1] : ''}
                                                            </span>
                                                        </Field>
                                                        <Field className="space-y-3">
                                                            <FieldLabel>Nhận xét chi tiết</FieldLabel>
                                                            <Textarea
                                                                value={newComment}
                                                                onChange={(e) => setNewComment(e.target.value)}
                                                                placeholder="Chia sẻ cảm nhận của bạn về học liệu, giảng viên hoặc trải nghiệm..."
                                                                className="min-h-[120px] rounded-xl resize-none text-sm"
                                                            />
                                                        </Field>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="ghost" onClick={() => setShowReviewForm(false)} className="rounded-xl font-bold">Hủy</Button>
                                                        <Button onClick={handleSubmitReview} disabled={submitting || newRating === 0} className="rounded-xl font-bold">
                                                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )
                                    ) : (
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            <p className="text-sm font-medium text-primary">
                                                Đăng ký khóa học để chia sẻ đánh giá của bạn
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reviews.length === 0 ? (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                                    <MessageSquare className="w-10 h-10 opacity-50" />
                                    <p className="text-sm font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                                </div>
                            ) : (
                                reviews.slice(0, 5).map((review) => (
                                    <ReviewItem key={review.id} review={review} />
                                ))
                            )}
                        </div>

                        {reviews.length > 5 && (
                            <div className="pt-4 flex justify-center">
                                <Button
                                    variant="outline"
                                    className="h-10 px-6 rounded-xl border-border text-sm font-bold hover:bg-muted"
                                    onClick={() => setShowAllReviews(true)}
                                >
                                    Xem tất cả đánh giá
                                    <ChevronRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* See All Portal */}
            {showAllReviews && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-6xl h-full bg-background rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                        {/* Close */}
                        <button
                            onClick={() => setShowAllReviews(false)}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Sidebar */}
                        <div className="hidden md:flex flex-col p-8 w-80 h-full border-r border-border bg-muted/10 overflow-y-auto">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <span className="text-5xl font-bold text-foreground tracking-tight">{roundedRating}</span>
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {renderStars(averageRating, false, 4)}
                                        </div>
                                        <div className="text-sm text-muted-foreground font-medium">{totalReviews} đánh giá</div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-border/50">
                                    <RatingBreakdown />
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative pt-16 md:pt-0">
                            <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <h3 className="text-lg font-bold text-foreground">Tất cả đánh giá</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Tìm đánh giá..."
                                        className="h-10 pl-9 pr-4 rounded-lg bg-muted/30 border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 text-sm transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/5">
                                <div className="max-w-3xl space-y-4 mx-auto">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="bg-background">
                                            <ReviewItem review={review} />
                                        </div>
                                    ))}
                                    {hasMore && (
                                        <div className="pt-8 text-center pb-4">
                                            <Button
                                                variant="outline"
                                                className="h-11 px-8 rounded-xl font-bold"
                                                onClick={() => setPage(p => p + 1)}
                                                disabled={loading}
                                            >
                                                {loading ? 'Đang tải...' : 'Tải thêm phản hồi'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
