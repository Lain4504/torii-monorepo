import React from 'react';
import Link from 'next/link';
import { Bot, User, Star } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface CourseCardProps {
    course: any;
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <div className="group bg-card text-card-foreground rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
            <Link href={`/courses/${course.slug || course.id}`} className="block relative aspect-video overflow-hidden">
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 transition-transform duration-500 group-hover:scale-110" />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {course.jlptLevel || "N/A"}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {course.category?.name || "General"}
                    </span>
                </div>
            </Link>

            <div className="p-5 flex-1 flex flex-col space-y-4">
                <Link href={`/courses/${course.slug || course.id}`}>
                    <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">{course.title}</h3>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                    {course.shortDescription || course.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        {course.lecturer?.displayName === "AI Assistant" ? (
                            <Bot className="size-4" />
                        ) : (
                            <User className="size-4" />
                        )}
                        <span className="truncate max-w-[100px]">{course.lecturer?.displayName || "Torii Instructor"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="size-4 text-yellow-500 fill-current" />
                        <span className="font-bold text-foreground">{Number(course.averageRating || 5).toFixed(1)}</span>
                        <span>({(course.totalReviews || 0).toLocaleString()})</span>
                    </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border">
                    {course.price === 0 ? (
                        <span className="text-lg font-bold text-primary italic">Miễn phí</span>
                    ) : (
                        <span className="text-lg font-bold text-foreground">
                            {Number(course.price || 0).toLocaleString()} ₫
                        </span>
                    )}
                    <div className="flex gap-2">
                        <Button size="sm" className="h-8" asChild>
                            <Link href={`/courses/${course.slug || course.id}`}>Chi tiết</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
