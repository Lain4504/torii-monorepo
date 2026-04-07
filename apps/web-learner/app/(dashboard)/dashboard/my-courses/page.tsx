'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Badge } from '@workspace/ui/components/badge'
import {
    BookOpen,
    Clock,
    ChevronRight,
    Video,
    Calendar,
    Star,
    User,
    GraduationCap
} from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CourseExpirationModal } from '@/components/courses/course-expiration-modal'
import { 
    useAcademyMyCourses, 
    useAcademyLearningStats 
} from '@/lib/api/services/academy-learning-progress-api'
import { 
    useMySchedule, 
    getLiveSessionUiState, 
    canJoinLiveSessionNow,
    liveSessionApi
} from '@/lib/api/services/academy-live-session-api'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@workspace/ui/lib/utils'

import { ClassReviewDialog } from '@/components/class-reviews/class-review-dialog'
import { academyClassReviewHooks } from '@/lib/api/services/academy-class-reviews'

export default function MyCoursesPage() {
    const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all')
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expiredCourse, setExpiredCourse] = useState<{ title: string, slug: string } | null>(null)

    const { data: myReviewsResp } = academyClassReviewHooks.useListMine()
    const myReviews = myReviewsResp?.data?.data || []

    const [reviewDialogProps, setReviewDialogProps] = useState<{
        isOpen: boolean;
        targetId: string;
        enrollmentId: string;
        courseTitle: string;
        existingReview?: any;
    }>({ isOpen: false, targetId: '', enrollmentId: '', courseTitle: '' })

    const { data: respCourses, isLoading: loadingCourses } = useAcademyMyCourses();
    const { data: respStats, isLoading: loadingStats } = useAcademyLearningStats();

    useEffect(() => {
        if (respCourses) setCourses(respCourses);
        if (!loadingCourses && !loadingStats) setLoading(false);
    }, [respCourses, loadingCourses, loadingStats]);

    const filteredCourses = courses.filter((course) => {
        const status = (course.status || "ACTIVE").toUpperCase();
        if (status === 'CANCELLED') return false;

        const matchesFilter =
            filter === 'all' ||
            (filter === 'in-progress' && (course.progress || 0) < 100 && status !== 'COMPLETED') ||
            (filter === 'completed' && ((course.progress || 0) >= 100 || status === 'COMPLETED'))
        
        return matchesFilter
    })

    const { data: schedule, isLoading: isLoadingSchedule } = useMySchedule();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                <Spinner className="size-6 text-primary" />
                <p className="text-xs font-bold text-muted-foreground/60 animate-pulse uppercase tracking-widest">Đang chuẩn bị lộ trình...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-8">
            {/* Header - Minimalist */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                        <GraduationCap className="size-6" />
                    </div>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Khóa học của tôi</h1>
                        <p className="text-xs font-medium text-muted-foreground/60">Quản lý và tiếp tục hành trình chinh phục tiếng Nhật của bạn.</p>
                    </div>
                </div>

            </div>

            {/* Next Live Session Alert - Redesigned to be Premium */}
            {(() => {
                const now = new Date();
                if (isLoadingSchedule || !schedule || schedule.length === 0) return null;

                const nextSession = schedule
                    .filter(s => getLiveSessionUiState(s, now) !== 'ended')
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

                if (!nextSession) return null;

                const uiState = getLiveSessionUiState(nextSession, now);
                const canJoin = canJoinLiveSessionNow(nextSession, now);
                const isLive = uiState === 'live' || uiState === 'joinable';

                return (
                    <div className={cn(
                        "relative overflow-hidden border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all",
                        isLive 
                            ? "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30" 
                            : "bg-primary/5 border-primary/10"
                    )}>
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                            <div className={cn(
                                "size-14 rounded-2xl flex items-center justify-center border shrink-0",
                                isLive ? "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600" : "bg-card border-border/40 text-primary"
                            )}>
                                <Video className={cn("size-6", isLive && "animate-pulse")} />
                            </div>
                            <div className="space-y-1.5 focus:outline-none">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <Badge variant={isLive ? "destructive" : "outline"} className="text-[9px] font-bold px-2 py-0.5 rounded-lg border-none">
                                        {isLive ? "ĐANG DIỄN RA" : "BUỔI HỌC TIẾP THEO"}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">{nextSession.courseTitle}</span>
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-foreground">{nextSession.title}</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-[11px] font-bold text-muted-foreground/60">
                                    <span className="flex items-center gap-1.5"><Calendar className="size-3.5 text-primary" /> {format(new Date(nextSession.scheduledAt), 'EEEE, dd/MM - HH:mm', { locale: vi })}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-primary" /> {nextSession.duration} phút</span>
                                </div>
                            </div>
                        </div>

                        {canJoin && (
                            <Button 
                                className="h-12 px-10 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 shrink-0"
                                onClick={async () => {
                                    try {
                                        const joinData = await liveSessionApi.joinSession(nextSession.id);
                                        const MEET_URL = (process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com');
                                        const url = `${MEET_URL}?access_token=${joinData.token}`;
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                    } catch (err) {}
                                }}
                            >
                                Vào lớp ngay
                                <ChevronRight className="ml-2 size-4" />
                            </Button>
                        )}
                    </div>
                );
            })()}

            {/* Filter Tabs */}
            <div className="flex justify-center md:justify-start pt-2">
                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(v) => setFilter(v as any)}>
                    <TabsList className="bg-muted/20 p-1 rounded-2xl border border-border/40 w-fit">
                        <TabsTrigger value="all" className="px-8 py-2 rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Tất cả</TabsTrigger>
                        <TabsTrigger value="in-progress" className="px-8 py-2 rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Đang học</TabsTrigger>
                        <TabsTrigger value="completed" className="px-8 py-2 rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Hoàn thành</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <Card
                            key={course.id}
                            className="group border border-border/40 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden shadow-none h-full flex flex-col"
                        >
                            {/* Course Image */}
                            <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                                {course.thumbnailUrl ? (
                                    <img 
                                        src={course.thumbnailUrl} 
                                        alt={course.courseTitle} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                        <BookOpen className="size-12 text-primary/20" />
                                    </div>
                                )}
                                
                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    {course.type?.toLowerCase() === 'live' && (
                                        <Badge className="bg-red-500 text-white border-none px-2 py-0.5 rounded-lg text-[9px] font-bold shadow-sm">
                                            LIVE
                                        </Badge>
                                    )}
                                    {course.progress >= 100 && (
                                        <Badge className="bg-emerald-500 text-white border-none px-2 py-0.5 rounded-lg text-[9px] font-bold shadow-sm">
                                            HOÀN THÀNH
                                        </Badge>
                                    )}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                                    <div 
                                        className="h-full bg-primary shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" 
                                        style={{ width: `${course.progress}%` }} 
                                    />
                                </div>
                            </div>

                            <CardContent className="p-6 flex-1 flex flex-col justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2.5">
                                        <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                                            {course.courseTitle}
                                        </h3>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground/60">
                                            <div className="flex items-center gap-1.5">
                                                <User className="size-3 text-primary" />
                                                <span className="truncate">{course.instructorName || 'Torii Academy'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 tabular-nums">
                                                <Clock className="size-3 text-primary" />
                                                {course.lastAccessed ? format(new Date(course.lastAccessed), 'dd/MM/yyyy') : 'Mới'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold">
                                            <span className="text-muted-foreground/60 uppercase tracking-tighter">Tiến độ khóa học</span>
                                            <span className="text-primary">{Math.round(course.progress || 0)}%</span>
                                        </div>
                                        <Progress value={course.progress || 0} className="h-1.5 bg-muted rounded-full" />
                                    </div>
                                </div>

                                <div className="flex gap-2.5">
                                    {(() => {
                                        const courseType = course.type?.toLowerCase();
                                        const isLive = courseType === 'live';
                                        const courseMasterId = isLive ? course.liveClassId : (course.vodPackageId ?? course.courseProfileId ?? course.id);

                                        if (course.expiresAt && new Date(course.expiresAt) < new Date()) {
                                            return (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpiredCourse({ title: course.courseTitle || "", slug: course.slug || "" })
                                                    }}
                                                    variant="destructive"
                                                    className="flex-1 h-10 rounded-2xl text-xs font-bold shadow-none"
                                                >
                                                    Gia hạn khóa học
                                                </Button>
                                            )
                                        }

                                        if (!courseMasterId) return null;

                                        return (
                                            <Link
                                                href={isLive ? `/dashboard/my-courses/${courseMasterId}` : `/courses/${courseMasterId}/learn`}
                                                className="flex-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button 
                                                    className="w-full h-11 rounded-2xl text-[11px] font-bold shadow-md shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                    variant={isLive ? 'default' : course.progress >= 100 ? "outline" : "default"}
                                                >
                                                    {isLive ? 'Vào lớp học' : course.progress === 0 ? 'Bắt đầu học' : course.progress >= 100 ? 'Học lại' : 'Tiếp tục học'}
                                                    <ChevronRight className="ml-1 size-3.5" />
                                                </Button>
                                            </Link>
                                        );
                                    })()}
                                    
                                    {course.progress >= 100 && (() => {
                                        const existingReview = myReviews.find(
                                            (r: any) => r.enrollmentId && r.enrollmentId === course.id,
                                        );
                                        const reviewTargetId = course.type?.toLowerCase() === 'live'
                                            ? course.liveClassId
                                            : course.vodPackageId;
                                        return (
                                            <Button
                                                variant="outline"
                                                className="size-11 rounded-2xl p-0 border-border/40 hover:bg-amber-50 hover:border-amber-200 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!reviewTargetId) return;
                                                    setReviewDialogProps({
                                                        isOpen: true,
                                                        targetId: reviewTargetId,
                                                        enrollmentId: course.id,
                                                        courseTitle: course.courseTitle || "",
                                                        existingReview
                                                    });
                                                }}
                                            >
                                                <Star className={cn("size-4", existingReview ? 'fill-amber-500 text-amber-500 border-none' : 'text-muted-foreground/40')} />
                                                <span className="sr-only">Đánh giá</span>
                                            </Button>
                                        );
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-6 text-center">
                        <div className="size-20 rounded-3xl bg-background flex items-center justify-center text-muted-foreground/20 border border-border">
                            <BookOpen className="size-10" />
                        </div>
                        <div className="space-y-2 px-6">
                            <h3 className="text-lg font-bold text-foreground">Chưa có khóa học nào</h3>
                            <p className="text-xs font-medium text-muted-foreground/60 max-w-xs mx-auto">Hãy bắt đầu hành trình chinh phục tiếng Nhật ngay hôm nay.</p>
                        </div>
                        <Button asChild className="mt-2 px-10 h-12 rounded-2xl font-bold text-xs shadow-lg shadow-primary/20">
                            <Link href="/dashboard/available-courses">Khám phá khóa học</Link>
                        </Button>
                    </div>
                )}
            </div>

            <CourseExpirationModal
                isOpen={!!expiredCourse}
                onClose={() => setExpiredCourse(null)}
                courseTitle={expiredCourse?.title || ''}
                courseSlug={expiredCourse?.slug || ''}
            />

            <ClassReviewDialog
                isOpen={reviewDialogProps.isOpen}
                setIsOpen={(isOpen) => setReviewDialogProps(prev => ({ ...prev, isOpen }))}
                targetId={reviewDialogProps.targetId}
                enrollmentId={reviewDialogProps.enrollmentId}
                courseTitle={reviewDialogProps.courseTitle}
                existingReview={reviewDialogProps.existingReview}
            />
        </div>
    )
}
