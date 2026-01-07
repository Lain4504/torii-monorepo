import Link from 'next/link';
import Image from 'next/image';
import { Star, Users, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import type { Course } from './useCourses';

interface CourseCardProps extends Course {
    isLive?: boolean;
}

/**
 * Course card component displaying course information
 */
export function CourseCard(props: CourseCardProps) {
    const {
        title,
        slug,
        thumbnail,
        level,
        rating = 0,
        reviewCount = 0,
        students = 0,
        price = 0,
        originalPrice = 0,
        totalLessons = 0,
        totalHours = 0,
        isLive = false,
    } = props;

    // Safe value defaults
    const safeThumbnail = thumbnail ?? '/default-thumbnail.jpg';
    const safeRating = typeof rating === 'number' ? rating : 0;
    const safeReviewCount = typeof reviewCount === 'number' ? reviewCount : 0;
    const safeStudents = typeof students === 'number' ? students : 0;
    const safePrice = typeof price === 'number' ? price : 0;
    const safeOriginalPrice = typeof originalPrice === 'number' ? originalPrice : 0;
    const safeTotalLessons = typeof totalLessons === 'number' ? totalLessons : 0;
    const safeTotalHours = typeof totalHours === 'number' ? totalHours : 0;
    return (
        <Link href={`/courses/${slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow flex flex-col group cursor-pointer">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                        src={safeThumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                    <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm">
                        {level}
                    </Badge>
                    {isLive && (
                        <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground border-0">
                            LIVE
                        </Badge>
                    )}
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-5 space-y-3">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                    </h3>

                    {/* Rating & Students */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-foreground">{safeRating}</span>
                            {[...Array(5)].map((_, i) => {
                                const isFull = i < Math.floor(safeRating);
                                const isHalf = i === Math.floor(safeRating) && safeRating % 1 >= 0.5;
                                return (
                                    <Star
                                        key={i}
                                        className="w-4 h-4"
                                        style={{
                                            color: isFull || isHalf ? '#FFD700' : 'currentColor',
                                        }}
                                        fill={isFull ? '#FFD700' : isHalf ? 'url(#half-star)' : 'none'}
                                    />
                                );
                            })}
                            <span>({safeReviewCount})</span>
                        </div>
                        <span className="text-muted-foreground/30">•</span>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{safeStudents.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Duration & Lessons */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{safeTotalLessons} bài</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{safeTotalHours} giờ</span>
                        </div>
                    </div>
                </CardContent>

                {/* Footer - Price */}
                <CardFooter className="p-5 pt-0 border-t mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-primary">
                            {safePrice === 0 ? 'Miễn phí' : `${safePrice.toLocaleString()}₫`}
                        </span>
                        {safeOriginalPrice > 0 && safeOriginalPrice > safePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                                {safeOriginalPrice.toLocaleString()}₫
                            </span>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
