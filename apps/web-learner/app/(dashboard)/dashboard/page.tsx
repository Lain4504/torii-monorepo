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
    Target
} from 'lucide-react'
import Link from 'next/link'

import { PageLoading } from '@workspace/ui/components/page-loading'

export default function DashboardPage() {
    const { user, status } = useAppSelector((state) => state.auth)

    if (status === 'loading') {
        return <PageLoading text="Đang tải dữ liệu..." />
    }

    const stats = [
        { label: 'Khóa học', value: '12', subValue: '5 hoàn thành', icon: BookOpen, color: 'text-blue-500' },
        { label: 'Giờ học', value: '48h', subValue: 'Tổng thời gian', icon: Clock, color: 'text-emerald-500' },
        { label: 'Chứng chỉ', value: '3', subValue: 'Đã nhận được', icon: Award, color: 'text-amber-500' },
        { label: 'Tiến độ', value: '58%', subValue: 'Trung bình', icon: TrendingUp, color: 'text-purple-500' },
    ]

    const recentCourses = [
        {
            id: 1,
            slug: 'tieng-nhat-n5-co-ban',
            title: 'Tiếng Nhật N5 - Cơ bản',
            progress: 65,
            instructor: 'Nguyễn Văn A',
        },
        {
            id: 2,
            slug: 'ngu-phap-n4',
            title: 'Ngữ pháp N4',
            progress: 30,
            instructor: 'Trần Thị B',
        },
    ]

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-6xl animate-in fade-in duration-500">
            {/* Minimal Welcome Header */}
            <div className="pb-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Chào mừng trở lại, <span className="text-primary">{user?.displayName || 'Học viên'}</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-medium opacity-70">
                    Bạn đã học được 12 giờ trong tuần này. Tuyệt vời!
                </p>
            </div>

            {/* Stats Grid - Ultra Minimal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="p-5 rounded-2xl border border-border/50 bg-muted/5 group hover:bg-muted/10 transition-all cursor-default">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-xl bg-background border border-border/50 ${stat.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Practice Tools Section - New Addition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/flashcards">
                    <div className="relative overflow-hidden group rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background border border-indigo-500/20 p-6 min-h-[160px] flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/10 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            {/* Brain icon placeholder - using div for now or import BrainCircuit */}
                            <div className="w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-50" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-1">Neural Memory Banks</h3>
                            <p className="text-xs font-medium text-muted-foreground max-w-[80%]">Spaced Repetition System (SRS) active. Enhance long-term retention.</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">System Ready</span>
                            </div>
                            <Button size="sm" variant="ghost" className="rounded-xl px-4 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white">
                                Access <ArrowRight className="ml-2 w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/exams">
                    <div className="relative overflow-hidden group rounded-[2rem] bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-background border border-blue-500/20 p-6 min-h-[160px] flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <div className="w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-50" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-1">Examination Protocols</h3>
                            <p className="text-xs font-medium text-muted-foreground max-w-[80%]">Standardized competency assessments. N5 - N1 levels available.</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500">Online</span>
                            </div>
                            <Button size="sm" variant="ghost" className="rounded-xl px-4 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white">
                                Initiate <ArrowRight className="ml-2 w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Continue Learning */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <PlayCircle className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold tracking-tight">Tiếp tục học</h2>
                            </div>
                            <Link href="/dashboard/my-courses">
                                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary cursor-pointer">
                                    Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-1 gap-4">
                            {recentCourses.map((course) => (
                                <Card key={course.id} className="border-border/50 shadow-none bg-card/30 hover:bg-card/50 transition-colors group cursor-pointer overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                            <div className="w-full sm:w-32 h-20 rounded-xl bg-muted/50 border border-border/30 flex-shrink-0 relative overflow-hidden group-hover:bg-muted transition-colors">
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <PlayCircle className="w-8 h-8 text-primary" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div>
                                                    <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Giảng viên: {course.instructor}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                                        <span>Tiến độ</span>
                                                        <span>{course.progress}%</span>
                                                    </div>
                                                    <Progress value={course.progress} className="h-1.5 bg-primary/10" />
                                                </div>
                                            </div>
                                            <div className="flex shrink-0">
                                                <Link href={`/courses/${course.slug}/learn`}>
                                                    <Button size="icon" variant="ghost" className="rounded-full w-10 h-10 hover:bg-primary/5 hover:text-primary">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-10">
                    {/* Upcoming Classes */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <Calendar className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Lớp sắp tới</h3>
                        </div>
                        <div className="space-y-3">
                            {upcomingClasses.map((classItem) => (
                                <div key={classItem.id} className="p-4 rounded-2xl border border-border/50 bg-background/50 flex items-start gap-4 group cursor-pointer hover:border-primary/30 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{classItem.title}</h4>
                                        <p className="text-[10px] text-muted-foreground font-medium">{classItem.date} • {classItem.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Goals */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <Target className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Mục tiêu tuần</h3>
                        </div>
                        <Card className="border-border/50 shadow-none bg-primary/5">
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-foreground">Hoàn thành 3 bài học mới</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Hành trình vạn dặm bắt đầu từ 1 bước chân</p>
                                </div>
                                <div className="space-y-2">
                                    <Progress value={66} className="h-1.5 bg-background" />
                                    <div className="flex justify-between text-[10px] font-bold text-primary tracking-widest uppercase">
                                        <span>2/3 Bài học</span>
                                        <span>66%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
