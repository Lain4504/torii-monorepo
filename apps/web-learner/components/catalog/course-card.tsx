import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import type { CourseSearchResponseDTO } from '@workspace/schemas'
import { cn } from '@workspace/ui/lib/utils'
import { formatCurrency } from '@/utils/format-utils'

interface CourseCardProps extends CourseSearchResponseDTO {
    isLive?: boolean
    className?: string
}

export function CourseCard(props: CourseCardProps) {
    const {
        title,
        slug,
        thumbnailUrl,
        jlptLevel,
        lecturer,
        averageRating = 0,
        totalReviews = 0,
        price = 0,
        discountPrice,
        totalLessons = 0,
        isLive = false,
        className,
    } = props

    const safeRating = typeof averageRating === 'number' ? averageRating : 0
    const safePrice = typeof price === 'number' ? price : 0
    const originalPrice = discountPrice ? price : 0
    const safeTotalLessons = typeof totalLessons === 'number' ? totalLessons : 0
    const isFree = safePrice === 0

    return (
        <Link href={`/courses/${slug}`} className="block h-full outline-none group">
            <div className={cn(
                'h-full flex flex-col bg-card border border-border rounded-xl overflow-hidden',
                'transition-all duration-300',
                'hover:shadow-xl hover:-translate-y-1',
                className
            )}>
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                        src={thumbnailUrl ?? '/default-thumbnail.jpg'}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 z-20 flex gap-2">
                        <Badge className="text-[10px] font-bold shadow-sm">
                            HOT
                        </Badge>
                        {jlptLevel && (
                            <Badge variant="secondary" className="text-[10px] font-bold shadow-sm">
                                {jlptLevel}
                            </Badge>
                        )}
                    </div>
                    {isLive && (
                        <div className="absolute bottom-3 left-3 z-20">
                            <Badge variant="destructive" className="text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                <span className="size-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                                LIVE
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="space-y-1.5">
                        <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {lecturer?.displayName || 'Chuyên gia Torii'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span className="font-bold">{safeRating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({totalReviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="size-3.5" />
                            <span>{safeTotalLessons} bài học</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <div className="flex items-baseline gap-2">
                            {isFree ? (
                                <span className="text-lg font-bold text-primary">Miễn phí</span>
                            ) : (
                                <>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(safePrice)}
                                    </span>
                                    {originalPrice > 0 && originalPrice > safePrice && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            {formatCurrency(originalPrice)}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs font-bold h-8 px-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                            Xem chi tiết
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    )
}
