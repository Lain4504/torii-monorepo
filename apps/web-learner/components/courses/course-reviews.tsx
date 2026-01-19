'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Star, ThumbsUp, MessageSquare, Plus, Search, Sparkles, ChevronRight, X } from 'lucide-react'
import { Progress } from '@workspace/ui/components/progress'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import type { CourseResponseDTO } from '@workspace/schemas'
import { reviewApi, type ReviewResponse, type RatingDistribution } from '@/apis/services/review-api'
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
        <div className="p-6 rounded-3xl bg-background border border-border/40 hover:border-border transition-colors group">
            <div className="flex gap-4">
                <Avatar className="h-10 w-10 rounded-xl border border-border/40 shadow-sm shrink-0">
                    <AvatarImage src={review.user.avatarUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                        {review.user.displayName ? review.user.displayName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-foreground">
                                {review.user.displayName}
                            </h4>
                            <div className="flex items-center gap-2">
                                {renderStars(review.rating, false, 3)}
                                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                                    Đã xác thực
                                </span>
                            </div>
                        </div>
                    </div>

                    {review.comment && (
                        <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                            "{review.comment}"
                        </p>
                    )}

                    <div className="flex items-center gap-4 pt-1">
                        <button className="flex items-center gap-1.5 group/btn cursor-pointer">
                            <ThumbsUp className="w-3 h-3 text-muted-foreground/40 group-hover/btn:text-primary transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover/btn:text-foreground transition-colors">Hữu ích</span>
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
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Đang tải đánh giá...</span>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700" id="reviews">
            <div className="flex items-center gap-4">
                <MessageSquare className="w-5 h-5 text-primary/40" />
                <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-foreground uppercase tracking-tight">Cảm tưởng học viên</h2>
            </div>

            <div>
                <div className="space-y-10 md:space-y-14">
                    {/* Review Summary */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-24">
                        <div className="flex flex-col items-center lg:items-start gap-4">
                            <span className="text-7xl md:text-9xl font-serif font-bold text-foreground tracking-tighter italic leading-[0.8]">
                                {roundedRating}
                            </span>
                            <div className="space-y-2 text-center lg:text-left">
                                <div className="flex justify-center lg:justify-start">
                                    {renderStars(averageRating, false, 5)}
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Điểm đánh giá trung bình</div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{totalReviews} học viên đã tham gia</div>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md w-full mx-auto lg:mx-0">
                            <RatingBreakdown />
                        </div>

                        <div className="hidden xl:block flex-1 max-w-[200px]">
                            <div className="p-6 rounded-[1.5rem] bg-background border border-border/40 text-center space-y-3">
                                <Sparkles className="w-6 h-6 text-primary mx-auto opacity-40" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">Được 98% học viên đánh giá cao</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 md:space-y-10 pt-8 md:pt-10 border-t border-border/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                            {isAuthenticated && !userReview && (
                                <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                                    <DialogTrigger asChild>
                                        <Button className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 cursor-pointer active:scale-95 transition-all w-full md:w-auto">
                                            <Plus className="mr-3 h-4 w-4" />
                                            Gửi đánh giá
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                                        <div className="p-10 space-y-10">
                                            <DialogHeader>
                                                <DialogTitle className="text-4xl font-serif font-bold italic tracking-tight text-foreground uppercase">Đánh giá <span className="text-primary not-italic">khóa học</span></DialogTitle>
                                                <DialogDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-4 leading-relaxed">
                                                    Những chia sẻ chân thực của bạn sẽ giúp cộng đồng học viên Torii có thêm thông tin hữu ích.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-8">
                                                <div className="flex flex-col items-center gap-6 py-10 bg-muted/20 rounded-[2.5rem] border border-border/40 relative overflow-hidden group/star">
                                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/star:opacity-100 transition-opacity" />
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 relative z-10">Mức độ hài lòng</label>
                                                    <div className="relative z-10">{renderStars(newRating, true, 10)}</div>
                                                    <span className="text-[11px] font-serif font-bold italic text-primary uppercase tracking-[0.2em] h-5 relative z-10">
                                                        {newRating > 0 ? ['Rất kém', 'Cần cải thiện', 'Tốt', 'Rất tốt', 'Tuyệt vời'][newRating - 1] : 'Hãy chọn mức độ hài lòng của bạn'}
                                                    </span>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4">Nhận xét chi tiết</label>
                                                    <Textarea
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Chia sẻ cảm nhận của bạn về học liệu, giảng viên hoặc trải nghiệm ứng dụng..."
                                                        className="min-h-[180px] rounded-[2rem] bg-muted/20 border-border/40 p-8 text-sm font-bold focus:bg-background focus:ring-0 resize-none transition-all placeholder:text-muted-foreground/20 leading-relaxed italic"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter className="gap-4 pt-4">
                                                <Button variant="ghost" onClick={() => setShowReviewForm(false)} className="rounded-xl font-black uppercase tracking-[0.2em] text-[10px] h-14 px-8 border-border/40 hover:bg-muted/40 transition-all">Hủy</Button>
                                                <Button onClick={handleSubmitReview} disabled={submitting || newRating === 0} className="flex-1 rounded-xl h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                                                    {submitting ? 'Đang gửi...' : 'Đăng nhận xét'}
                                                </Button>
                                            </DialogFooter>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.length === 0 ? (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40 grayscale">
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
                            <div className="pt-6 md:pt-10 flex justify-center">
                                <Button
                                    variant="outline"
                                    className="h-12 md:h-14 px-8 md:px-12 rounded-2xl border-border/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-background transition-all"
                                    onClick={() => setShowAllReviews(true)}
                                >
                                    Xem tất cả đánh giá
                                    <ChevronRight className="ml-2 w-3.5 h-3.5 md:w-4 md:h-4 opacity-40" />
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
                                        <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">{totalReviews} đánh giá đã xác thực</div>
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
                                    <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Ý kiến từ Cộng đồng</h3>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Sắp xếp theo mức độ phù hợp</div>
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
