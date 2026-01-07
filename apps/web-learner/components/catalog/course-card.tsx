import Link from 'next/link';
import Image from 'next/image';
import { Star, Users, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import type { CourseResponseDTO } from '@workspace/schemas';

interface CourseCardProps extends CourseResponseDTO {
    isLive?: boolean;
}

/**
 * Course card component displaying course information
 */
export function CourseCard(props: CourseCardProps) {
    const {
        title,
        slug,
        thumbnailUrl,
        jlptLevel,
        averageRating = 0,
        totalReviews = 0,
        totalStudents = 0,
        price = 0,
        discountPrice = 0,
        totalLessons = 0,
        durationWeeks = 0,
        isLive = false,
    } = props;

    // Safe value defaults
    const safeThumbnail = thumbnailUrl ?? '/default-thumbnail.jpg';
    const safeRating = typeof averageRating === 'number' ? averageRating : 0;
    const safeReviewCount = typeof totalReviews === 'number' ? totalReviews : 0;
    const safeStudents = typeof totalStudents === 'number' ? totalStudents : 0;
    const safePrice = typeof price === 'number' ? price : 0;
    const safeDiscountPrice = typeof discountPrice === 'number' ? discountPrice : 0;
    const safeTotalLessons = typeof totalLessons === 'number' ? totalLessons : 0;
    const safeDurationWeeks = typeof durationWeeks === 'number' ? durationWeeks : 0;
    return (
        <Link href={`/courses/${slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800 flex flex-col group cursor-pointer">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <Image
                        src={safeThumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-white/90 text-slate-900 hover:bg-white dark:bg-slate-900/90 dark:text-white backdrop-blur-sm shadow-sm">
                        {jlptLevel}
                    </Badge>
                    {isLive && (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white animate-pulse border-0">
                            LIVE
                        </Badge>
                    )}
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-5 space-y-3">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {title}
                    </h3>

                    {/* Rating & Students */}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900 dark:text-white">{safeRating}</span>
                            {[...Array(5)].map((_, i) => {
                                const isFull = i < Math.floor(safeRating);
                                const isHalf = i === Math.floor(safeRating) && safeRating % 1 >= 0.5;
                                return (
                                    <Star
                                        key={i}
                                        className="w-4 h-4"
                                        style={{
                                            color: isFull || isHalf ? '#FFD700' : '#E5E7EB',
                                        }}
                                        fill={isFull ? '#FFD700' : isHalf ? 'url(#half-star)' : 'none'}
                                    />
                                );
                            })}
                            <span>({safeReviewCount})</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{safeStudents.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Duration & Lessons */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{safeTotalLessons} bài</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{safeDurationWeeks} tuần</span>
                        </div>
                    </div>
                </CardContent>

                {/* Footer - Price */}
                <CardFooter className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-teal-600">
                            {safePrice === 0 ? 'Miễn phí' : `${safePrice.toLocaleString()}₫`}
                        </span>
                        {safeDiscountPrice > 0 && safeDiscountPrice < safePrice && (
                            <span className="text-xs text-slate-400 line-through">
                                {safePrice.toLocaleString()}₫
                            </span>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
