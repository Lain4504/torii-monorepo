import { Star, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { cn } from '@workspace/ui/lib/utils'
import { ReviewResponse } from '@/apis/services/review-api'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface ReviewItemProps {
    review: ReviewResponse & { courseTitle?: string; courseSlug?: string }
    className?: string
    onDelete?: (id: string) => void
}

export function ReviewItem({ review, className, onDelete }: ReviewItemProps) {
    const router = useRouter()

    const handleCardClick = () => {
        if (review.courseSlug) {
            router.push(`/courses/${review.courseSlug}`)
        }
    }

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "group relative overflow-hidden rounded-2xl bg-card p-6 transition-all duration-300",
                "border border-border/50",
                "shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer",
                className
            )}
        >
            {/* Delete Button - Absolute Positioned */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(review.id);
                    }}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-all"
                    title="Xóa đánh giá"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}

            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={review.user.avatarUrl} alt={review.user.displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {review.user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-bold text-card-foreground text-sm">{review.user.displayName}</h4>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-3.5 w-3.5",
                                            i < review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 relative z-10">
                {review.courseTitle && (
                    <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {review.courseTitle}
                    </div>
                )}
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {review.comment}
                </p>
            </div>

            {/* Decorative blob for claymorphism feel */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-primary/0 blur-2xl transition-all duration-500 group-hover:bg-primary/10 pointer-events-none" />
        </div>
    )
}
