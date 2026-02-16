'use client'

import { useAppSelector } from '@/hooks/hooks'
import { Card, CardContent } from '@workspace/ui/components/card'
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

                    <div className="flex items-center gap-4">
                        <div className="px-5 py-3 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-2 min-w-[180px] shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center">
                                        <Star className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
                                    </div>
                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Cấp độ {user?.level || 1}</p>
                                </div>
                                <p className="text-xs font-black text-amber-900">{user?.xp || 0} XP</p>
                            </div>
                            <div className="w-full h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${((user?.xp || 0) % 1000) / 10}%` }}
                                />
                            </div>
                            <p className="text-[9px] font-bold text-amber-600 text-right">Còn {1000 - ((user?.xp || 0) % 1000)} XP đến cấp tiếp theo</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Minimal Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={index}
                                className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl bg-primary/10 text-primary`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                    <p className="text-xs font-medium text-muted-foreground mt-1">{stat.label}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Practice Tools Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/dashboard/flashcards">
                        <div className="relative group rounded-2xl bg-card border border-border p-8 min-h-[200px] flex flex-col justify-between hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold mb-4">
                                    <Target className="size-3.5" />
                                    Luyện trí nhớ
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">Thẻ nhớ Flashcards</h3>
                                <p className="text-sm text-muted-foreground max-w-[90%] leading-relaxed">Hệ thống lặp lại ngắt quãng (SRS) giúp tối ưu hóa khả năng ghi nhớ dài hạn.</p>
                            </div>
                            <div className="relative z-10 flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs font-medium text-muted-foreground">Đã đồng bộ</span>
                                </div>
                                <Button size="sm" variant="ghost" className="rounded-lg font-bold text-xs hover:bg-primary/10 hover:text-primary transition-all">
                                    Bắt đầu học <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </Link>

                    <Link href="/assessment">
                        <div className="relative group rounded-2xl bg-card border border-border p-8 min-h-[200px] flex flex-col justify-between hover:border-blue-500/50 hover:shadow-lg transition-all duration-300">
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold mb-4">
                                    <Award className="size-3.5" />
                                    Kiểm tra năng lực
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">Thi thử JLPT</h3>
                                <p className="text-sm text-muted-foreground max-w-[90%] leading-relaxed">Các bài thi chuẩn hóa giúp đánh giá trình độ ngôn ngữ chính xác.</p>
                            </div>
                            <div className="relative z-10 flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span className="text-xs font-medium text-muted-foreground">Sẵn sàng</span>
                                </div>
                                <Button size="sm" variant="ghost" className="rounded-lg font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-all">
                                    Làm bài thi <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
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
                                                "rounded-2xl border border-border bg-card transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md",
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
                                            <CardContent className="p-4 sm:p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                                    <div className="w-full sm:w-40 h-24 rounded-xl bg-muted border border-border/50 flex-shrink-0 relative overflow-hidden">
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
                                                            "rounded-xl w-10 h-10 transition-colors",
                                                            isExpired ? "hover:bg-destructive hover:text-white" : "hover:bg-primary hover:text-white"
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
                                    <div className="p-8 rounded-2xl border border-border bg-card text-center shadow-sm">
                                        <p className="text-muted-foreground font-medium text-sm">Bạn chưa tham gia khóa học nào.</p>
                                        <Link href="/courses">
                                            <Button variant="outline" className="mt-4 rounded-xl font-bold">Khám phá khóa học</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Upcoming Classes */}
                        <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">Lịch học trực tuyến</h3>
                            </div>
                            <div className="space-y-4">
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
                            </div>
                            <Button variant="ghost" className="w-full rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground">Xem lịch chi tiết</Button>
                        </div>

                        {/* Weekly Goals */}
                        <div className="space-y-6 p-6 rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                    <Target className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">Mục tiêu tuần</h3>
                            </div>
                            <div className="space-y-4">
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
                            </div>
                            <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">Tối ưu hóa tập trung</Button>
                        </div>

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
