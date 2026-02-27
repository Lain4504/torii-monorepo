import Link from 'next/link'
import Image from 'next/image'
import { Star, Users, BookOpen, ArrowRight } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import type { CourseSearchResponseDTO } from '@workspace/schemas'
import { cn } from '@workspace/ui/lib/utils'
import { formatNumber, formatCurrency } from '@/utils/format-utils'

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
        instructor,
        averageRating = 0,
        totalReviews = 0,
        totalStudents = 0,
        price = 0,
        discountPrice,
        totalLessons = 0,
        isLive = false,
        className,
    } = props

    const safeRating = typeof averageRating === 'number' ? averageRating : 0
    const safeStudents = typeof totalStudents === 'number' ? totalStudents : 0
    const safePrice = typeof price === 'number' ? price : 0
    const originalPrice = discountPrice ? price : 0
    const safeTotalLessons = typeof totalLessons === 'number' ? totalLessons : 0
    const isFree = safePrice === 0

    return (
        <Link href={`/courses/${slug}`} className="block h-full outline-none">
            <Card className={cn('h-full overflow-hidden flex flex-col', className)}>
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                        src={thumbnailUrl ?? '/default-thumbnail.jpg'}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                    <div className="absolute top-3 left-3 z-20 flex gap-2">
                        <Badge className="text-[10px] font-bold">
                            HOT
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-bold">
                            {jlptLevel}
                        </Badge>
                    </div>
                    {isLive && (
                        <div className="absolute bottom-3 left-3 z-20">
                            <Badge variant="destructive" className="text-[10px] font-bold flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                                LIVE
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-4 flex flex-col gap-3">
                    <div>
                        <h3 className="font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">
                            {title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {instructor?.displayName || 'Chuyên gia Torii'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-foreground">{safeRating.toFixed(1)}</span>
                            <span>({totalReviews})</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="size-3.5" />
                            {formatNumber(safeStudents)}
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="size-3.5" />
                            {safeTotalLessons} bài
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t">
                        <div>
                            {originalPrice > 0 && originalPrice > safePrice && (
                                <p className="text-[10px] text-muted-foreground line-through">
                                    {formatCurrency(originalPrice)}
                                </p>
                            )}
                            <p className="text-sm font-bold text-primary">
                                {isFree ? 'MIỄN PHÍ' : formatCurrency(safePrice)}
                            </p>
                        </div>
                        <span className="text-xs font-bold text-primary flex items-center gap-1">
                            Học ngay <ArrowRight className="size-3.5" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
