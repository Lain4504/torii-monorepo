import { Star, ThumbsUp } from 'lucide-react'
import { Progress } from '@workspace/ui/components/progress'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import type { CourseResponseDTO } from '@workspace/schemas'

interface CourseReviewsProps {
    course: CourseResponseDTO
}

export function CourseReviews({ course }: CourseReviewsProps) {
    const averageRating = Number(course.averageRating) || 0
    const totalReviews = course.totalReviews || 0
    const roundedRating = Math.round(averageRating * 10) / 10

    // For now, we'll show placeholder distribution since we don't have detailed review data
    // In the future, this should come from a reviews API endpoint
    const ratingDistribution = [
        { stars: 5, percent: 0 },
        { stars: 4, percent: 0 },
        { stars: 3, percent: 0 },
        { stars: 2, percent: 0 },
        { stars: 1, percent: 0 },
    ]

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        className={`w-5 h-5 ${
                            i <= fullStars
                                ? 'fill-yellow-400 text-yellow-400'
                                : i === fullStars + 1 && hasHalfStar
                                ? 'fill-yellow-400/50 text-yellow-400'
                                : 'text-slate-300'
                        }`}
                    />
                ))}
            </div>
        )
    }

    if (totalReviews === 0) {
        return (
            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đánh giá từ học viên</h2>
                <div className="text-center py-12 text-slate-500">
                    <p>Chưa có đánh giá nào cho khóa học này.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đánh giá từ học viên</h2>

            {/* Review Summary */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl min-w-[200px]">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white mb-2">{roundedRating}</span>
                    {renderStars(averageRating)}
                    <span className="text-sm text-slate-500 mt-2">{totalReviews.toLocaleString()} đánh giá</span>
                </div>

                <div className="flex-1 w-full space-y-2">
                    {ratingDistribution.map((rating) => (
                        <div key={rating.stars} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-3">{rating.stars}</span>
                            <Star className="w-4 h-4 text-slate-400" />
                            <Progress value={rating.percent} className="h-2" />
                            <span className="text-sm text-slate-500 w-10 text-right">{rating.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List - Placeholder for now */}
            <div className="space-y-6">
                <div className="text-center py-8 text-slate-500">
                    <p>Danh sách đánh giá chi tiết sẽ được hiển thị khi có API reviews.</p>
                </div>
            </div>

            {totalReviews > 0 && (
                <Button variant="outline" className="w-full">Xem thêm đánh giá</Button>
            )}
        </div>
    )
}
