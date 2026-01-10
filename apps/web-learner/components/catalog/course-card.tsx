import Link from 'next/link';
import Image from 'next/image';
import { Star, Users, BookOpen, Clock, PlayCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import type { Course } from './useCourses';
import { cn } from '@workspace/ui/lib/utils';

interface CourseCardProps extends Course {
    isLive?: boolean;
    className?: string; // Allow custom classes
}

/**
 * Course card component displaying course information
 * Pro Max Rebuild
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
        className,
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

    const isFree = safePrice === 0;

    return (
        <Link href={`/courses/${slug}`} className="block h-full group">
            <Card className={cn(
                "h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col",
                className
            )}>
                {/* Thumbnail Section */}
                <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                        src={safeThumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-md shadow-sm border-0 font-medium">
                            {level}
                        </Badge>
                        {isLive && (
                            <Badge variant="destructive" className="animate-pulse shadow-sm border-0 font-medium">
                                LIVE
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-5 space-y-4 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-[60px]">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-foreground">{safeRating.toFixed(1)}</span>
                            <span className="text-muted-foreground/60 text-xs">({safeReviewCount})</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-primary/70" />
                            <span>{safeStudents.toLocaleString()}</span>
                            <span className="sr-only">Students</span>
                        </div>
                    </div>

                    <div className="flex-1" /> {/* Spacer */}

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <BookOpen className="w-3.5 h-3.5 text-primary/60" />
                            <span>{safeTotalLessons} bài học</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Clock className="w-3.5 h-3.5 text-primary/60" />
                            <span>{safeTotalHours} giờ</span>
                        </div>
                    </div>
                </CardContent>

                {/* Footer Section */}
                <CardFooter className="p-5 pt-0 mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        {safeOriginalPrice > 0 && safeOriginalPrice > safePrice && (
                            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                                {safeOriginalPrice.toLocaleString()}₫
                            </span>
                        )}
                        <span className={cn(
                            "font-bold text-xl",
                            isFree ? "text-green-500" : "text-primary"
                        )}>
                            {isFree ? 'Miễn phí' : `${safePrice.toLocaleString()}₫`}
                        </span>
                    </div>

                    <Button size="sm" variant="ghost" className="rounded-full w-9 h-9 p-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-4 h-4" />
                        <span className="sr-only">View Course</span>
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
