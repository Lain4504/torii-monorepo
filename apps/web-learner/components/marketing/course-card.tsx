import React from 'react';
import Link from 'next/link';
import { Bot, ChevronRight, User, Users } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';

interface CourseCardProps {
    course: {
        id: string;
        slug?: string;
        title: string;
        shortDescription?: string;
        description?: string;
        thumbnailUrl?: string;
        jlptLevel?: string;
        type?: string;
        totalStudents?: number;
        averageRating?: number;
        totalReviews?: number;
        lecturer?: { displayName?: string } | null | undefined;
    };
}

export function CourseCard({ course }: CourseCardProps) {
    const formatLabel = course.type?.toUpperCase() === 'LIVE' ? 'Live' : course.type?.toUpperCase() === 'VOD' ? 'VOD' : 'Khóa học';
    const href = `/courses/${course.slug || course.id}`;

    return (
        <Card className="group h-full overflow-hidden border border-primary/10 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 cursor-pointer">
            <Link href={href} className="block relative aspect-video overflow-hidden">
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5" />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                        {course.jlptLevel || 'N/A'}
                    </Badge>
                    <Badge className="bg-primary/90 text-primary-foreground border-none text-[10px] font-bold uppercase tracking-wider">
                        {formatLabel}
                    </Badge>
                </div>
            </Link>

            <CardHeader className="p-5 pb-2">
                <Link href={href}>
                    <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {course.title}
                    </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                    {course.shortDescription || course.description}
                </p>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        {course.lecturer?.displayName === 'AI Assistant' ? (
                            <Bot className="size-4" />
                        ) : (
                            <User className="size-4" />
                        )}
                        <span className="truncate max-w-[120px]">{course.lecturer?.displayName || 'Torii Instructor'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>{(course.totalStudents || 0).toLocaleString()} học viên</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                        Xem giá & lịch khai giảng theo từng đợt
                    </span>
                    <Button size="sm" variant="ghost" className="h-8 gap-1" asChild>
                        <Link href={href}>
                            Chi tiết
                            <ChevronRight className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
