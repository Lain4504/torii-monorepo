'use client'

import { useAppSelector } from '@/hooks/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import {
    BookOpen,
    PlayCircle,
    Award,
    Clock,
    TrendingUp,
    Calendar,
    ArrowRight,
    ChevronRight,
    Target,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { learningProgressApi, useMyCourses } from '@/apis/services/learning-progress-api'
import { StreakWelcomeModal } from '@/components/dashboard/streak-welcome-modal'
import { useLeaderboard } from '@/apis/services/gamification-api'
import { LeaderboardPreview } from '@/components/dashboard/leaderboard'
import { Star } from 'lucide-react'

import { PageLoading } from '@workspace/ui/components/page-loading'
import { CourseExpirationModal } from '@/components/courses/course-expiration-modal'
import { useState } from 'react'

export default function DashboardPage() {
    const { user, status: authStatus } = useAppSelector((state) => state.auth)
    const { data: courses, isLoading: coursesLoading } = useMyCourses()
    const [expiredCourse, setExpiredCourse] = useState<{ title: string, slug: string } | null>(null)
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: learningProgressApi.getStats
    })
    const { data: leaderboardData, isLoading: isLeaderboardLoading } = useLeaderboard('global')

    if (authStatus === 'loading' || coursesLoading || statsLoading) {
        return <PageLoading text="Đang tải dữ liệu..." />
    }

    const stats = [
        { label: 'Khóa học', value: statsData?.totalCourses || 0, subValue: `${statsData?.completedCourses || 0} hoàn thành`, icon: BookOpen, color: 'text-blue-500' },
        { label: 'Giờ học', value: `${statsData?.totalLearningHours || 0}h`, subValue: 'Tổng thời gian', icon: Clock, color: 'text-emerald-500' },
        { label: 'Chứng chỉ', value: statsData?.completedCourses || 0, subValue: 'Đã nhận được', icon: Award, color: 'text-amber-500' },
        { label: 'Tiến độ', value: `${statsData?.averageProgress || 0}%`, subValue: 'Trung bình', icon: TrendingUp, color: 'text-purple-500' },
    ]

    const recentCourses = courses?.slice(0, 3) || []

    const upcomingClasses = [
        {
            id: 1,
            title: 'Lớp trực tuyến - Ngữ pháp N4',
            time: '14:00 - 15:30',
            date: 'Hôm nay',
        },
        {
            id: 2,
            title: 'Lớp trực tuyến - Luyện nói N3',
            time: '19:00 - 20:30',
            date: 'Ngày mai',
        },
    ]

    return (
        <>
            <StreakWelcomeModal />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-6xl animate-in fade-in duration-500">
                {/* Enhanced Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                            Chào mừng trở lại, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Học viên'}</span>.
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground mt-2">
                            Chào mừng bạn đến với Học viện Torii. Chúc bạn một ngày học tập hiệu quả!
                        </p>
                    </div>

                </div>

                {/* Stats Grid - Minimal Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <Card
                                key={index}
                                className="border border-border shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2.5 rounded-xl bg-primary/10 text-primary`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                        <p className="text-xs font-medium text-muted-foreground mt-1">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Practice Tools Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/dashboard/flashcards">
                        <Card className="group flex flex-col justify-between h-full min-h-[200px] hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold mb-3 w-fit">
                                    <Target className="size-3.5" />
                                    Luyện trí nhớ
                                </div>
                                <CardTitle className="text-2xl font-bold">Thẻ nhớ Flashcards</CardTitle>
                                <CardDescription className="max-w-[90%] text-sm">
                                    Hệ thống lặp lại ngắt quãng (SRS) giúp tối ưu hóa khả năng ghi nhớ dài hạn.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex items-center justify-between mt-auto pt-6 bg-transparent border-t border-border/50 rounded-none">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs font-medium text-muted-foreground">Đã đồng bộ</span>
                                </div>
                                <Button size="sm" variant="ghost" className="rounded-lg font-bold text-xs hover:bg-primary/10 hover:text-primary transition-all group-hover:bg-primary/5">
                                    Bắt đầu học <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </Link>

                    <Link href="/assessment">
                        <Card className="group flex flex-col justify-between h-full min-h-[200px] hover:border-blue-500/50 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold w-fit mb-3">
                                    <Award className="size-3.5" />
                                    Kiểm tra năng lực
                                </div>
                                <CardTitle className="text-2xl font-bold">Thi thử JLPT</CardTitle>
                                <CardDescription className="max-w-[90%] text-sm">
                                    Các bài thi chuẩn hóa giúp đánh giá trình độ ngôn ngữ chính xác.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex items-center justify-between mt-auto pt-6 bg-transparent border-t border-border/50 rounded-none">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span className="text-xs font-medium text-muted-foreground">Sẵn sàng</span>
                                </div>
                                <Button size="sm" variant="ghost" className="rounded-lg font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-all group-hover:bg-blue-50">
                                    Làm bài thi <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Continue Learning */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <PlayCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">Đang học</h2>
                                </div>
                                <Link href="/dashboard/my-courses">
                                    <Button variant="ghost" size="sm" className="font-bold text-xs text-muted-foreground hover:text-foreground">
                                        Tất cả khóa học <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid gap-4">
                                {recentCourses.map((course, idx) => {
                                    const isExpired = course.expiresAt && new Date(course.expiresAt) < new Date();

                                    return (
                                        <Card
                                            key={course.id}
                                            className={cn(
                                                "transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md block",
                                                isExpired ? "opacity-90 border-destructive/20" : "hover:border-primary/50 cursor-pointer"
                                            )}
                                            onClick={() => {
                                                if (isExpired) {
                                                    setExpiredCourse({ title: course.title, slug: course.slug })
                                                } else {
                                                    window.location.href = `/courses/${course.slug}/learn`;
                                                }
                                            }}
                                        >
                                            <CardContent className="p-4 sm:p-6 pb-4 sm:pb-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                                    <div className="w-full sm:w-40 h-24 rounded-lg bg-muted border border-border/50 flex-shrink-0 relative overflow-hidden">
                                                        {course.thumbnailUrl ? (
                                                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                                                <BookOpen className="w-8 h-8" />
                                                            </div>
                                                        )}
                                                        {isExpired && (
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                                                <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> Hết hạn
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        <div>
                                                            <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                                {course.title}
                                                            </h3>
                                                            <p className="text-xs font-medium text-muted-foreground mt-1">Giảng viên: {course.instructor}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                                                <span>Tiến độ</span>
                                                                <span className={isExpired ? "text-destructive" : "text-primary"}>
                                                                    {isExpired ? 'Đã hết hạn' : `${course.progress}%`}
                                                                </span>
                                                            </div>
                                                            <Progress value={course.progress} className={cn("h-1.5 bg-muted", isExpired && "[&>div]:bg-muted-foreground")} />
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0">
                                                        <Button size="icon" variant="ghost" className={cn(
                                                            "w-10 h-10 transition-colors",
                                                            isExpired ? "hover:bg-destructive hover:text-white" : "group-hover:bg-primary group-hover:text-white"
                                                        )}>
                                                            {isExpired ? <ArrowRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                                {recentCourses.length === 0 && (
                                    <Card className="shadow-sm">
                                        <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[160px] pb-8">
                                            <p className="text-muted-foreground font-medium text-sm">Bạn chưa tham gia khóa học nào.</p>
                                            <Button variant="outline" asChild className="mt-4 font-bold">
                                                <Link href="/courses">Khám phá khóa học</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Upcoming Classes */}
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center gap-3 pb-4">
                                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <CardTitle className="text-sm font-bold m-0">Lịch học trực tuyến</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {upcomingClasses.map((classItem) => (
                                    <div key={classItem.id} className="p-4 rounded-xl border border-border bg-background flex items-start gap-4 hover:border-orange-200 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                            <Clock className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h4 className="text-sm font-bold text-foreground truncate">{classItem.title}</h4>
                                            <p className="text-xs font-medium text-muted-foreground">{classItem.date} • {classItem.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="bg-transparent rounded-none pt-2">
                                <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-foreground">Xem lịch chi tiết</Button>
                            </CardFooter>
                        </Card>

                        {/* Weekly Goals */}
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                    <Target className="w-4 h-4" />
                                </div>
                                <CardTitle className="text-sm font-bold">Mục tiêu tuần</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <div>
                                    <p className="text-base font-bold text-foreground">Lộ trình học tập</p>
                                    <p className="text-xs text-muted-foreground mt-1">"Hành trình vạn dặm bắt đầu từ một bước chân."</p>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-border/50">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                            <span>Hoàn thành</span>
                                            <span className="text-emerald-600">{statsData?.averageProgress || 0}%</span>
                                        </div>
                                        <Progress value={statsData?.averageProgress || 0} className="h-1.5 bg-muted" />
                                    </div>
                                    <p className="text-xs text-center font-medium text-muted-foreground">{statsData?.completedCourses || 0} khóa học hoàn thành</p>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-transparent rounded-none">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">Tối ưu hóa tập trung</Button>
                            </CardFooter>
                        </Card>

                        {/* Leaderboard Preview */}
                        <LeaderboardPreview
                            data={leaderboardData}
                            isLoading={isLeaderboardLoading}
                        />
                    </div>
                </div>
            </div>
            <CourseExpirationModal
                isOpen={!!expiredCourse}
                onClose={() => setExpiredCourse(null)}
                courseTitle={expiredCourse?.title || ''}
                courseSlug={expiredCourse?.slug || ''}
            />
        </>
    )
}
