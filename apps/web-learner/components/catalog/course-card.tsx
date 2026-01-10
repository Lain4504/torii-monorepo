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
                "h-full overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm hover:bg-background transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 flex flex-col rounded-[2rem] relative",
                className
            )}>
                {/* Thumbnail Section */}
                <div className="relative aspect-video overflow-hidden bg-muted m-2 rounded-[1.5rem]">
                    <Image
                        src={safeThumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badge Overlays */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-background/90 backdrop-blur-md border-transparent text-foreground shadow-xl">
                            {level}
                        </Badge>
                        {isLive && (
                            <Badge className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-600 text-white border-transparent shadow-xl flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                LIVE
                            </Badge>
                        )}
                    </div>

                    {/* Play Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                        <div className="w-14 h-14 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl shadow-primary/40">
                            <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 px-8 py-6 flex flex-col gap-5">
                    <div className="space-y-3">
                        {/* Rating & Level */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="text-[11px] font-black tracking-tighter text-foreground">{safeRating.toFixed(1)}</span>
                                <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">({reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground/40 group-hover:text-primary transition-colors">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Premium Content</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-black tracking-tight line-clamp-2 leading-[1.2] text-foreground group-hover:text-primary transition-colors min-h-[3rem]">
                            {title}
                        </h3>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 group/icon">
                            <Users className="w-4 h-4 text-muted-foreground/40 group-hover/icon:text-primary transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{safeStudents > 1000 ? `${(safeStudents / 1000).toFixed(1)}k` : safeStudents}</span>
                        </div>
                        <div className="flex items-center gap-2 group/icon">
                            <BookOpen className="w-4 h-4 text-muted-foreground/40 group-hover/icon:text-primary transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{safeTotalLessons} Lessons</span>
                        </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/20">
                        <div className="flex flex-col">
                            {safeOriginalPrice > 0 && safeOriginalPrice > safePrice && (
                                <span className="text-[10px] font-bold text-muted-foreground/40 line-through tracking-wider">
                                    {safeOriginalPrice.toLocaleString()}₫
                                </span>
                            )}
                            <span className={cn(
                                "text-xl font-black tracking-tighter",
                                isFree ? "text-emerald-500" : "text-primary"
                            )}>
                                {isFree ? 'FREE' : `${safePrice.toLocaleString()}₫`}
                            </span>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
