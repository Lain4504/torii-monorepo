'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp } from 'lucide-react'
import { Progress } from '@workspace/ui/components/progress'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import type { CourseResponseDTO } from '@workspace/schemas'
import { reviewApi, type ReviewResponse, type RatingDistribution } from '@/api/services/review-api'
import { useAppSelector } from '@/hooks/hooks'
import { toast } from '@workspace/ui/components/sonner'

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
    const [newRating, setNewRating] = useState(0)
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const user = useAppSelector((state) => state.auth.user)

    // Check if user has already reviewed
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
            // Reload rating distribution
            await loadRatingDistribution()
        } catch (error: any) {
            console.error('Failed to submit review:', error)
            toast.error(error?.response?.data?.message || 'Không thể gửi đánh giá')
        } finally {
            setSubmitting(false)
        }
    }

    const renderStars = (rating: number, interactive: boolean = false) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        className={`w-5 h-5 ${
                            i <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={() => interactive && setNewRating(i)}
                    />
                ))}
            </div>
        )
    }

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

    if (loading && page === 1) {
        return (
            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-foreground">Đánh giá từ học viên</h2>
                <div className="text-center py-12 text-muted-foreground">
                    <p>Đang tải đánh giá...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Đánh giá từ học viên</h2>

            {totalReviews === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Chưa có đánh giá nào cho khóa học này.</p>
                    {isAuthenticated && !userReview && (
                        <Button
                            onClick={() => setShowReviewForm(true)}
                            className="mt-4"
                            variant="outline"
                        >
                            Viết đánh giá đầu tiên
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    {/* Review Summary */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-lg min-w-[200px]">
                            <span className="text-5xl font-bold text-card-foreground mb-2">
                                {roundedRating}
                            </span>
                            {renderStars(averageRating)}
                            <span className="text-sm text-muted-foreground mt-2">
                                {totalReviews.toLocaleString()} đánh giá
                            </span>
                        </div>

                        <div className="flex-1 w-full space-y-2">
                            {distribution.map((rating) => (
                                <div key={rating.stars} className="flex items-center gap-3">
                                    <span className="text-sm font-medium w-3">{rating.stars}</span>
                                    <Star className="w-4 h-4 text-muted-foreground" />
                                    <Progress value={rating.percent} className="h-2" />
                                    <span className="text-sm text-muted-foreground w-10 text-right">
                                        {rating.percent}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Write Review Form */}
                    {isAuthenticated && !userReview && !showReviewForm && (
                        <div className="bg-card border rounded-lg p-6">
                            <Button
                                onClick={() => setShowReviewForm(true)}
                                variant="outline"
                                className="w-full cursor-pointer"
                            >
                                Viết đánh giá
                            </Button>
                        </div>
                    )}

                    {showReviewForm && (
                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <h3 className="font-semibold text-card-foreground">
                                Đánh giá của bạn
                            </h3>
                            <div>
                                <label className="text-sm font-medium text-card-foreground mb-2 block">
                                    Đánh giá
                                </label>
                                {renderStars(newRating, true)}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-card-foreground mb-2 block">
                                    Nhận xét (tùy chọn)
                                </label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                                    className="w-full min-h-[100px] p-3 border rounded-lg bg-background text-foreground"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={submitting || newRating === 0}
                                    className="flex-1"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowReviewForm(false)
                                        setNewRating(0)
                                        setNewComment('')
                                    }}
                                    variant="outline"
                                    className="cursor-pointer"
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-card border rounded-lg p-6"
                            >
                                <div className="flex gap-4">
                                    <Avatar>
                                        <AvatarImage src={review.user.avatarUrl} />
                                        <AvatarFallback>
                                            {review.user.displayName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-card-foreground">
                                                    {review.user.displayName}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            {renderStars(review.rating)}
                                        </div>
                                        {review.comment && (
                                            <p className="text-card-foreground">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <Button
                            onClick={() => setPage((prev) => prev + 1)}
                            variant="outline"
                            className="w-full cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
                        </Button>
                    )}
                </>
            )}
        </div>
    )
}
