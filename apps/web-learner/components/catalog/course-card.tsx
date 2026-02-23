import Link from 'next/link'
import Image from 'next/image'
import { Star, Users, BookOpen, ArrowRight } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import type { Course } from './useCourses'
import { cn } from '@workspace/ui/lib/utils'
import { formatNumber, formatCurrency } from '@/utils/format-utils'

interface CourseCardProps extends Course {
    isLive?: boolean
    className?: string
}

export function CourseCard(props: CourseCardProps) {
    const {
        title,
        slug,
        thumbnail,
        level,
        instructor,
        rating = 0,
        reviewCount = 0,
        students = 0,
        price = 0,
        originalPrice = 0,
        totalLessons = 0,
        isLive = false,
        className,
    } = props

    const safeRating = typeof rating === 'number' ? rating : 0
    const safeStudents = typeof students === 'number' ? students : 0
    const safePrice = typeof price === 'number' ? price : 0
    const safeOriginalPrice = typeof originalPrice === 'number' ? originalPrice : 0
    const safeTotalLessons = typeof totalLessons === 'number' ? totalLessons : 0
    const isFree = safePrice === 0

    return (
        <Link href={`/courses/${slug}`} className="block h-full group outline-none">
            <Card className={cn('h-full overflow-hidden flex flex-col hover:border-primary/40 transition-colors', className)}>
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                        src={thumbnail ?? '/default-thumbnail.jpg'}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-20">
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                            HOT
                        </Badge>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                            {level}
                        </Badge>
                        {isLive && (
                            <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                TRỰC TUYẾN
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-4 flex flex-col gap-3">
                    <div>
                        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">
                            {title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {instructor?.name || 'Chuyên gia Torii'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="font-medium text-foreground">{safeRating.toFixed(1)}</span>
                            <span>({reviewCount})</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {formatNumber(safeStudents)}
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {safeTotalLessons} bài
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t">
                        <div>
                            {safeOriginalPrice > 0 && safeOriginalPrice > safePrice && (
                                <p className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(safeOriginalPrice)}
                                </p>
                            )}
                            <p className={cn('text-sm font-bold', isFree ? 'text-primary' : 'text-primary')}>
                                {isFree ? 'MIỄN PHÍ' : formatCurrency(safePrice)}
                            </p>
                        </div>
                        <span className="text-xs font-medium text-primary flex items-center gap-1">
                            Xem ngay <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
