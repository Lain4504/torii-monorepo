import { Star, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'
import { type ClassReview as ReviewResponse } from '@/lib/api/services/academy-class-reviews'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'

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
                "group relative overflow-hidden bg-card p-6 transition-all duration-300 rounded-lg",
                "border border-border/50",
                "hover:bg-muted/30 cursor-pointer",
                className
            )}
        >
            {/* Delete Button - Absolute Positioned */}
            {onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(review.id);
                    }}
                    className="absolute top-4 right-4 z-50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8"
                    title="Xóa đánh giá"
                >
                    <Trash2 className="size-4" />
                </Button>
            )}

            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Avatar className="size-10 ring-2 ring-border">
                        <AvatarImage src={review.user.avatarUrl || undefined} alt={review.user.displayName} />
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
                                            i < review.rating ? "fill-yellow-500 text-yellow-500" : "fill-muted text-muted"
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

            <div className="mt-4 relative z-10 flex flex-wrap items-center gap-2">
                {review.courseTitle && (
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                        {review.courseTitle}
                    </Badge>
                )}

                {/* Contextual Badge */}
                {review.cohortId ? (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-blue-200 text-blue-600 bg-blue-50/50">
                        Học Live
                    </Badge>
                ) : review.vodPackageId ? (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-orange-200 text-orange-600 bg-orange-50/50">
                        Học VOD
                    </Badge>
                ) : null}

                {review.class?.name && review.class.name !== review.courseTitle && (
                    <span className="text-[11px] text-muted-foreground italic">
                        &bull; {review.class.name}
                    </span>
                )}
            </div>

            <div className="mt-3 relative z-10">
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {review.content}
                </p>
            </div>


        </div>
    )
}
