'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import {
    Search,
    BookOpen,
    Clock,
    ChevronRight,
    Video,
    Calendar,
    Star,
    User
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
import { formatNumber } from '@/utils/format-utils'

import { ClassReviewDialog } from '@/components/class-reviews/class-review-dialog'
import { academyClassReviewHooks } from '@/lib/api/services/academy-class-reviews'

export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all')
    const [courses, setCourses] = useState<any[]>([])
    const [statsData, setStatsData] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [expiredCourse, setExpiredCourse] = useState<{ title: string, slug: string } | null>(null)

    const { data: myReviewsResp } = academyClassReviewHooks.useListMine()
    const myReviews = myReviewsResp?.data?.data || []

    const [reviewDialogProps, setReviewDialogProps] = useState<{
        isOpen: boolean;
        targetId: string;
        targetType: 'COHORT' | 'VOD';
        enrollmentId: string;
        courseTitle: string;
        existingReview?: any;
    }>({ isOpen: false, targetId: '', targetType: 'COHORT', enrollmentId: '', courseTitle: '' })

    const { data: respCourses, isLoading: loadingCourses } = useAcademyMyCourses();
    const { data: respStats, isLoading: loadingStats } = useAcademyLearningStats();

    useEffect(() => {
        if (respCourses) setCourses(respCourses);
        if (respStats) setStatsData(respStats);
        if (!loadingCourses && !loadingStats) setLoading(false);
    }, [respCourses, respStats, loadingCourses, loadingStats]);

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = (course.courseTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
        
        const status = (course.status || "ACTIVE").toUpperCase();
        if (status === 'CANCELLED') return false;

        const matchesFilter =
            filter === 'all' ||
            (filter === 'in-progress' && (course.progress || 0) < 100 && status !== 'COMPLETED') ||
            (filter === 'completed' && ((course.progress || 0) >= 100 || status === 'COMPLETED'))
        
        return matchesSearch && matchesFilter
    })

    const { data: schedule, isLoading: isLoadingSchedule } = useMySchedule();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-pulse">
                <Spinner className="size-6 text-primary/40" />
                <p className="text-[10px] font-semibold text-muted-foreground/40 animate-pulse">Đang đồng bộ dữ liệu...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-8">
            {/* Standard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <div className="space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Khóa học của tôi</h1>
                    <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                        Quản lý tiến độ học tập và tiếp tục hành trình chinh phục tiếng Nhật của bạn qua các khóa học đã đăng ký.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30" />
                        <Input
                            placeholder="Tìm kiếm khóa học..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 rounded-xl bg-muted/20 border-border/40 focus-visible:ring-primary/20 text-xs font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Next Live Session Alert - Subtle & Premium */}
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
                    <Card className={cn(
                        "relative overflow-hidden border border-border/40 bg-card rounded-2xl shadow-none transition-all",
                        isLive && "border-red-500/20 bg-red-500/[0.02]"
                    )}>
                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "hidden sm:flex size-14 rounded-2xl items-center justify-center border",
                                    isLive ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-primary/5 border-primary/10 text-primary/40"
                                )}>
                                    <Video className={cn("size-6", isLive && "animate-pulse")} />
                                </div>
                                <div className="space-y-1.5 text-center sm:text-left">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1 text-[10px] font-bold uppercase tracking-widest leading-none">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md",
                                            isLive ? "bg-red-500 text-white" : "bg-primary/10 text-primary border border-primary/20"
                                        )}>
                                            {isLive ? "Trực tiếp" : "Buổi học sắp tới"}
                                        </span>
                                        <span className="text-muted-foreground/40">{nextSession.courseTitle}</span>
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground/80">{nextSession.title}</h2>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 text-[11px] font-semibold text-muted-foreground/50">
                                        <span className="flex items-center gap-1.5"><Calendar className="size-3.5 text-primary/40" /> {format(new Date(nextSession.scheduledAt), 'EEEE, dd/MM - HH:mm', { locale: vi })}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-primary/40" /> {nextSession.duration} phút</span>
                                    </div>
                                </div>
                            </div>

                            {canJoin && (
                                <Button 
                                    className="bg-primary text-white hover:bg-primary/90 h-11 px-8 rounded-xl font-bold text-[11px] shadow-none group transition-all"
                                    onClick={async () => {
                                        try {
                                            const joinData = await liveSessionApi.joinSession(nextSession.id);
                                            const MEET_URL = (process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com');
                                            const url = `${MEET_URL}?access_token=${joinData.token}`;
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                        } catch (err: any) {
                                            console.error('Failed to join:', err);
                                        }
                                    }}
                                >
                                    Vào lớp ngay
                                    <ChevronRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            )}
                        </div>
                    </Card>
                );
            })()}

            {/* Simple Grid Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(v) => setFilter(v as any)}>
                    <TabsList className="bg-muted/30 p-1 rounded-xl border border-border/40">
                        <TabsTrigger value="all" className="px-8 py-2 rounded-lg text-[10px] font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Tất cả</TabsTrigger>
                        <TabsTrigger value="in-progress" className="px-8 py-2 rounded-lg text-[10px] font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Đang học</TabsTrigger>
                        <TabsTrigger value="completed" className="px-8 py-2 rounded-lg text-[10px] font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Đã xong</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <Card
                            key={course.id}
                            className="group border-border/40 bg-card hover:bg-muted/5 hover:border-primary/20 transition-all duration-300 rounded-2xl overflow-hidden shadow-none h-full flex flex-col pt-0 pb-0"
                        >
                            <div className="relative aspect-[16/10] bg-muted/10 overflow-hidden">
                                {course.thumbnailUrl ? (
                                    <img 
                                        src={course.thumbnailUrl} 
                                        alt={course.courseTitle} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="size-10 text-muted-foreground/10" />
                                    </div>
                                )}
                                
                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    {course.type?.toLowerCase() === 'live' && (
                                        <Badge className="bg-red-500 text-white border-none px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                            TRỰC TIẾP
                                        </Badge>
                                    )}
                                    {course.progress >= 100 && (
                                        <Badge className="bg-emerald-500 text-white border-none px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                            HOÀN THÀNH
                                        </Badge>
                                    )}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000 ease-in-out" 
                                        style={{ width: `${course.progress}%` }} 
                                    />
                                </div>
                            </div>

                            <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg tracking-tight text-foreground/80 leading-tight line-clamp-2 transition-colors group-hover:text-primary">
                                            {course.courseTitle}
                                        </h3>
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground/40">
                                            <div className="flex items-center gap-1.5">
                                                <User className="size-3 text-primary/30" />
                                                <span className="truncate">{course.instructorName || 'Torii Academy'}</span>
                                            </div>
                                            <span className="flex items-center gap-1.5 tabular-nums">
                                                <Clock className="size-3 text-primary/30" />
                                                {course.lastAccessed ? format(new Date(course.lastAccessed), 'dd/MM/yyyy') : 'Mới'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground/30">
                                            <span>Tiến độ học tập</span>
                                            <span className="text-primary/60">{Math.round(course.progress || 0)}%</span>
                                        </div>
                                        <Progress value={course.progress || 0} className="h-1 bg-muted/60" />
                                    </div>
                                </div>

                                <div className="flex gap-2.5">
                                    {(() => {
                                        const courseType = course.type?.toLowerCase();
                                        const isLive = courseType === 'live';
                                        const courseMasterId = isLive
                                            ? course.liveClassId
                                            : (course.vodPackageId ?? course.courseProfileId ?? course.id);

                                        if (course.expiresAt && new Date(course.expiresAt) < new Date()) {
                                            return (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpiredCourse({ title: course.courseTitle || "", slug: course.slug || "" })
                                                    }}
                                                    variant="destructive"
                                                    className="flex-1 h-10 rounded-xl text-[10px] font-bold shadow-none"
                                                >
                                                    Gia hạn
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
                                                    className="w-full h-10 rounded-xl text-[10px] font-bold shadow-none transition-all"
                                                    variant={isLive ? 'destructive' : course.progress >= 100 ? "outline" : "default"}
                                                >
                                                    {isLive ? 'Vào lớp' : course.progress === 0 ? 'Bắt đầu học' : course.progress >= 100 ? 'Học lại' : 'Tiếp tục'}
                                                    <ChevronRight className="ml-2 size-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                </Button>
                                            </Link>
                                        );
                                    })()}
                                    
                                    {course.progress >= 100 && (() => {
                                        const existingReview = myReviews.find((r: any) =>
                                            (r.cohortId && r.cohortId === course.cohortId) ||
                                            (r.vodPackageId && r.vodPackageId === course.vodPackageId)
                                        );
                                        return (
                                            <Button
                                                variant="outline"
                                                className="size-10 rounded-xl p-0 border-border/40 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReviewDialogProps({
                                                        isOpen: true,
                                                        targetId: course.cohortId || course.vodPackageId,
                                                        targetType: course.type?.toLowerCase() === 'live' ? 'COHORT' : 'VOD',
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
                    <div className="col-span-full py-20 bg-muted/5 rounded-2xl border border-dashed border-border/50 flex flex-col items-center justify-center gap-6 text-center">
                        <div className="size-16 rounded-2xl bg-muted/10 flex items-center justify-center text-muted-foreground/20">
                            <BookOpen className="size-8" />
                        </div>
                        <div className="space-y-1.5 px-6">
                            <p className="text-sm font-semibold text-foreground/40">Không tìm thấy khóa học nào</p>
                            <p className="text-[11px] font-medium text-muted-foreground/30">Hãy thử kiểm tra lại bộ lọc hoặc khám phá thêm lộ trình mới.</p>
                        </div>
                        <Button asChild variant="outline" className="mt-4 px-8 h-11 rounded-xl font-bold text-[10px] border-primary/20 text-primary/60 hover:bg-primary/5 shadow-none">
                            <Link href="/dashboard/available-courses">Khám phá ngay</Link>
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
                targetType={reviewDialogProps.targetType}
                enrollmentId={reviewDialogProps.enrollmentId}
                courseTitle={reviewDialogProps.courseTitle}
                existingReview={reviewDialogProps.existingReview}
            />
        </div>
    )
}
