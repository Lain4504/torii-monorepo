import Link from 'next/link';
import Image from 'next/image';
import { Star, Users, BookOpen, ArrowRight, Play, Sparkles } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import type { Course } from './useCourses';
import { cn } from '@workspace/ui/lib/utils';

interface CourseCardProps extends Course {
    isLive?: boolean;
    className?: string;
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
        totalHours = 0,
        isLive = false,
        className,
    } = props;

    const safeThumbnail = thumbnail ?? '/default-thumbnail.jpg';
    const safeRating = typeof rating === 'number' ? rating : 0;
    const safeStudents = typeof students === 'number' ? students : 0;
    const safePrice = typeof price === 'number' ? price : 0;
    const safeOriginalPrice = typeof originalPrice === 'number' ? originalPrice : 0;
    const safeTotalLessons = typeof totalLessons === 'number' ? totalLessons : 0;

    const isFree = safePrice === 0;

    return (
        <Link href={`/courses/${slug}`} className="block h-full group outline-none">
            <Card className={cn(
                "h-full overflow-hidden border-border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col rounded-2xl cursor-pointer",
                className
            )}>
                {/* Thumbnail Section */}
                <div className="relative aspect-video overflow-hidden bg-muted rounded-t-2xl">
                    <Image
                        src={safeThumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Play Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-[1px] transition-all duration-300">
                        <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                    </div>

                    {/* Badge Overlays */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-background/90 text-foreground border-none shadow-sm">
                            {level}
                        </Badge>
                        {isLive && (
                            <Badge className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white border-none shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                TRỰC TUYẾN
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-5 flex flex-col gap-4">
                    <div className="space-y-3">
                        {/* Rating & Level Metadata */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="text-sm font-bold text-foreground">{safeRating.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">({reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-1 text-primary/60">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">Verified</span>
                            </div>
                        </div>

                        {/* Title & Instructor */}
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {title}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                                Giảng viên: {instructor?.name || 'Chuyên gia Torii'}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 py-3 border-y border-border/50">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">{safeStudents.toLocaleString()} Học viên</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">{safeTotalLessons} Bài học</span>
                        </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between mt-auto pt-1">
                        <div className="flex flex-col">
                            {safeOriginalPrice > 0 && safeOriginalPrice > safePrice && (
                                <span className="text-xs font-medium text-muted-foreground/60 line-through">
                                    {safeOriginalPrice.toLocaleString()} VNĐ
                                </span>
                            )}
                            <div className="flex items-center gap-1">
                                <span className={cn(
                                    "text-lg font-bold",
                                    isFree ? "text-emerald-600" : "text-primary"
                                )}>
                                    {isFree ? 'MIỄN PHÍ' : `${safePrice.toLocaleString()} VNĐ`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center text-primary font-bold text-sm bg-primary/5 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                            Xem ngay
                            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
