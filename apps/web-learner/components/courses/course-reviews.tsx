'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Star, ThumbsUp, MessageSquare, Plus, Search, Sparkles, SlidersHorizontal, ChevronRight, X } from 'lucide-react'
import { Progress } from '@workspace/ui/components/progress'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import type { CourseResponseDTO } from '@workspace/schemas'
import { reviewApi, type ReviewResponse, type RatingDistribution } from '@/api/services/review-api'
import { useAppSelector } from '@/hooks/hooks'
import { toast } from '@workspace/ui/components/sonner'
import { cn } from '@workspace/ui/lib/utils'

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
                setReviews(response.data)
            } else {
                setReviews((prev) => [...prev, ...response.data])
            }
            setHasMore(response.page < response.totalPages)
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
        <div className="py-8 border-b border-border/20 last:border-0 group animate-in fade-in duration-500">
            <div className="flex gap-6">
                <Avatar className="h-12 w-12 rounded-[1rem] border border-border/40 shadow-sm shrink-0">
                    <AvatarImage src={review.user.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-sm font-black uppercase">
                        {review.user.displayName ? review.user.displayName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h4 className="text-sm font-black uppercase tracking-tight text-foreground">
                                {review.user.displayName}
                            </h4>
                            <div className="flex items-center gap-3">
                                {renderStars(review.rating, false, 3)}
                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                    Verified Learner
                                </span>
                            </div>
                        </div>
                    </div>

                    {review.comment && (
                        <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed italic">
                            "{review.comment}"
                        </p>
                    )}

                    <div className="flex items-center gap-6 pt-2">
                        <button className="flex items-center gap-2 group/btn cursor-pointer">
                            <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/btn:text-primary transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover/btn:text-foreground transition-colors">Helpful</span>
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
        <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((star) => {
                const stat = distribution.find(d => d.stars === star) || { stars: star, count: 0, percent: 0 }
                return (
                    <div key={star} className="flex items-center gap-4 group cursor-default">
                        <div className="flex items-center gap-1.5 w-8">
                            <span className="text-[10px] font-black text-foreground">{star}</span>
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden relative">
                            <div
                                className="absolute inset-y-0 left-0 bg-primary/60 group-hover:bg-primary transition-all duration-700 rounded-full"
                                style={{ width: `${stat.percent}%` }}
                            />
                        </div>
                        <div className="w-10 text-right">
                            <span className="text-[10px] font-black text-muted-foreground/40">{stat.percent}%</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )

    if (loading && page === 1) {
        return (
            <div className="py-24 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Loading perspectives...</span>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700" id="reviews">
            <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Phản hồi từ học viên</h2>
            </div>

            <div className="rounded-[2.5rem] bg-muted/20 border border-border/40 overflow-hidden">
                <div className="p-10 lg:p-14 space-y-14">
                    {/* Review Summary */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-24">
                        <div className="flex flex-col items-center lg:items-start gap-4">
                            <span className="text-7xl font-black text-foreground tracking-tighter italic leading-none">
                                {roundedRating}
                            </span>
                            <div className="space-y-2 text-center lg:text-left">
                                <div className="flex justify-center lg:justify-start">
                                    {renderStars(averageRating, false, 4)}
                                </div>
                                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Average Course Rating</div>
                                <div className="text-[10px] font-bold text-primary italic uppercase tracking-widest">{totalReviews} Verified Subscriptions</div>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md w-full">
                            <RatingBreakdown />
                        </div>

                        <div className="hidden xl:block flex-1 max-w-[200px]">
                            <div className="p-6 rounded-[1.5rem] bg-background border border-border/40 text-center space-y-3">
                                <Sparkles className="w-6 h-6 text-primary mx-auto opacity-40" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">Top rated by 98% of students</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-10 pt-10 border-t border-border/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm đánh giá..."
                                        className="h-12 pl-12 pr-6 rounded-xl bg-background border-border/40 focus:border-primary/40 focus:ring-0 text-xs font-bold w-full md:w-64 transition-all"
                                    />
                                </div>
                                <Button variant="outline" className="h-12 w-12 rounded-xl border-border/40">
                                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground/40" />
                                </Button>
                            </div>

                            {isAuthenticated && !userReview && (
                                <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                                    <DialogTrigger asChild>
                                        <Button className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 cursor-pointer active:scale-95 transition-all">
                                            <Plus className="mr-2.5 h-4 w-4" />
                                            Viết đánh giá
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-10 gap-8">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Đánh giá <span className="text-primary italic not-italic">Khóa Học</span></DialogTitle>
                                            <DialogDescription className="text-sm font-bold text-muted-foreground/60 leading-relaxed">
                                                Cảm nhận chân thực của bạn giúp cộng đồng học viên Torii phát triển bền vững.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-10">
                                            <div className="flex flex-col items-center gap-4 py-4 bg-muted/30 rounded-[2rem] border border-border/40">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Mức độ hài lòng của bạn</label>
                                                {renderStars(newRating, true, 8)}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary h-4">
                                                    {newRating > 0 ? ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][newRating - 1] : 'Hãy chọn điểm số'}
                                                </span>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 pl-2">Nhận xét chi tiết</label>
                                                <Textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Bạn thích nhất điều gì ở giáo trình, hay Sensei hỗ trợ ra sao?..."
                                                    className="min-h-[160px] rounded-[1.5rem] bg-muted/20 border-border/40 p-6 text-sm font-bold focus:bg-background focus:ring-0 resize-none transition-all placeholder:text-muted-foreground/30"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button variant="ghost" onClick={() => setShowReviewForm(false)} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6">Hủy</Button>
                                            <Button onClick={handleSubmitReview} disabled={submitting || newRating === 0} className="rounded-xl h-12 px-10 bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        <div className="grid gap-2">
                            {reviews.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40 grayscale">
                                    <MessageSquare className="w-12 h-12" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Hãy là người đầu tiên cảm nhận</p>
                                </div>
                            ) : (
                                reviews.slice(0, 5).map((review) => (
                                    <ReviewItem key={review.id} review={review} />
                                ))
                            )}
                        </div>

                        {reviews.length > 5 && (
                            <div className="pt-10 flex justify-center">
                                <Button
                                    variant="outline"
                                    className="h-14 px-12 rounded-2xl border-border/40 text-[10px] font-black uppercase tracking-widest hover:bg-background transition-all"
                                    onClick={() => setShowAllReviews(true)}
                                >
                                    Xem tất cả đánh giá
                                    <ChevronRight className="ml-2 w-4 h-4 opacity-40" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* See All Portal */}
            {showAllReviews && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="relative w-full max-w-7xl h-full bg-background rounded-[2.5rem] border border-border/40 shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
                        {/* Close */}
                        <button
                            onClick={() => setShowAllReviews(false)}
                            className="absolute top-8 right-8 z-20 w-12 h-12 rounded-2xl bg-muted/40 hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer active:scale-90"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Sidebar */}
                        <div className="hidden md:flex flex-col p-12 w-[28rem] h-full border-r border-border/20 bg-muted/10 overflow-y-auto">
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <span className="text-8xl font-black text-foreground tracking-tighter italic leading-none">{roundedRating}</span>
                                    <div className="space-y-2">
                                        <div className="flex gap-1">
                                            {renderStars(averageRating, false, 5)}
                                        </div>
                                        <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">{totalReviews} Verified Perspectives</div>
                                    </div>
                                </div>

                                <div className="pt-12 border-t border-border/20">
                                    <RatingBreakdown />
                                </div>

                                <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                                    <Sparkles className="w-6 h-6 text-primary opacity-40" />
                                    <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic">"Cộng đồng học viên Torii luôn chia sẻ một cách văn minh và trung thực."</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative pt-20 md:pt-0">
                            <div className="p-8 md:p-12 border-b border-border/20 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Community Mentions</h3>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Sorted by most relevant</div>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                                    <input
                                        type="text"
                                        placeholder="Lọc đánh giá..."
                                        className="h-12 pl-12 pr-6 rounded-xl bg-muted/20 border-border/40 focus:bg-background focus:ring-0 text-xs font-bold w-full md:w-64 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                                <div className="max-w-3xl space-y-2">
                                    {reviews.map((review) => (
                                        <ReviewItem key={review.id} review={review} />
                                    ))}
                                    {hasMore && (
                                        <div className="pt-12 text-center pb-8">
                                            <Button
                                                variant="outline"
                                                className="h-14 px-12 rounded-2xl border-border/40 text-[10px] font-black uppercase tracking-widest hover:bg-background"
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
