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
                "h-full overflow-hidden border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 flex flex-col rounded-[2.5rem] relative cursor-pointer",
                className
            )}>
                {/* Thumbnail Section */}
                <div className="relative aspect-video overflow-hidden bg-muted/40 m-2 rounded-[1.8rem]">
                    <Image
                        src={safeThumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Play Icon on Hover - Dashboard Style */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/20 backdrop-blur-[2px] transition-all duration-500">
                        <div className="w-14 h-14 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl shadow-primary/40 scale-50 group-hover:scale-100 transition-transform duration-500">
                            <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                    </div>

                    {/* Badge Overlays */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="secondary" className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-background/90 backdrop-blur-md text-foreground border-none shadow-lg">
                            {level}
                        </Badge>
                        {isLive && (
                            <Badge className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-red-600 text-white border-none shadow-lg flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                LIVE
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-6 pt-2 flex flex-col gap-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {/* Rating & Level Metadata */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span className="text-[11px] font-black tracking-tighter text-foreground">{safeRating.toFixed(1)}</span>
                                    <span className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-tight">({reviewCount} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-primary/40">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified</span>
                                </div>
                            </div>

                            {/* Title & Instructor */}
                            <div className="space-y-1.5">
                                <h3 className="text-xl font-serif font-bold italic tracking-tight leading-[1.1] text-foreground group-hover:text-primary transition-colors uppercase">
                                    {title}
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic leading-none">
                                    By {instructor?.name || 'Academic Faculty'}
                                </p>
                            </div>
                        </div>

                        {/* Stats - Horizontal Divider Style */}
                        <div className="flex items-center gap-6 py-4 border-y border-border/10">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary/30" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{safeStudents.toLocaleString()} Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary/30" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{safeTotalLessons} Modules</span>
                            </div>
                        </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            {safeOriginalPrice > 0 && safeOriginalPrice > safePrice && (
                                <span className="text-[10px] font-black text-muted-foreground/20 line-through tracking-widest uppercase">
                                    {safeOriginalPrice.toLocaleString()} VNĐ
                                </span>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className={cn(
                                    "text-xl md:text-2xl font-serif font-bold italic tracking-tighter leading-none",
                                    isFree ? "text-emerald-500" : "text-primary"
                                )}>
                                    {isFree ? 'FREE' : `${safePrice.toLocaleString()} VNĐ`}
                                </span>
                                {!isFree && <span className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground/30 ml-1">/ one-time</span>}
                            </div>
                        </div>

                        <div className="w-12 h-12 rounded-[1.2rem] bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-sm">
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
