import Link from 'next/link';
import { Star, Users, BookOpen } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Course } from '@/api/services/courses-api';

interface CourseCardProps extends Course {
    isLive?: boolean;
}

/**
 * Course card component displaying course information
 */
export function CourseCard({
    id,
    title,
    slug,
    thumbnailUrl,
    jlptLevel,
    averageRating = 0,
    totalReviews = 0,
    totalStudents = 0,
    price = 0,
    discountPrice,
    totalLessons = 0,
    isLive = false,
}: CourseCardProps) {
    const safeThumbnail = thumbnailUrl ?? '/default-thumbnail.jpg';
    const displayPrice = price === 0 ? 'Free' : `$${price}`;

    return (
        <Link href={`/courses/${slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800 flex flex-col group cursor-pointer">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                        src={safeThumbnail}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                            <span className="font-bold text-slate-900 dark:text-white">
                                {averageRating.toFixed(1)}
                            </span>
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className="w-4 h-4"
                                    style={{
                                        color:
                                            i < Math.floor(averageRating)
                                                ? '#FFD700'
                                                : '#E5E7EB',
                                    }}
                                    fill={
                                        i < Math.floor(averageRating)
                                            ? '#FFD700'
                                            : 'none'
                                    }
                                />
                            ))}
                            <span>({totalReviews})</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{totalStudents.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Lessons */}
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <BookOpen className="w-4 h-4" />
                        <span>{totalLessons} lessons</span>
                    </div>
                </CardContent>

                {/* Footer with Price */}
                <CardFooter className="p-5 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-teal-600">{displayPrice}</span>
                        {discountPrice && discountPrice > price && (
                            <span className="text-xs text-slate-400 line-through">
                                ${discountPrice}
                            </span>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
