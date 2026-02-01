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
    Bot,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { learningProgressApi, useMyCourses } from '@/apis/services/learning-progress-api'
import { StreakWelcomeModal } from '@/components/dashboard/streak-welcome-modal'

import { PageLoading } from '@workspace/ui/components/page-loading'

export default function DashboardPage() {
    const { user, status: authStatus } = useAppSelector((state) => state.auth)
    const { data: courses, isLoading: coursesLoading } = useMyCourses()
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: learningProgressApi.getStats
    })

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
                {/* Minimal Welcome Header */}
                <div className="pb-2">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Chào mừng trở lại, <br />
                        <span className="text-primary not-italic">{user?.displayName?.split(' ')[0] || 'Học viên'}</span>.
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-6 italic border-l-2 border-primary/20 pl-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        Chào mừng bạn đến với Học viện Torii
                    </p>
                </div>

                {/* Stats Grid - Ultra Minimal Zen Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={index}
                                className="p-8 rounded-[2.5rem] border border-border/40 bg-background/40 backdrop-blur-3xl group hover:border-primary/40 transition-all duration-700 cursor-default shadow-sm hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-3.5 rounded-2xl bg-muted/30 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-4xl font-serif font-bold tracking-tighter italic">{stat.value}</p>
                                    <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em] mt-2 italic">{stat.label}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Practice Tools Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/dashboard/flashcards">
                        <div className="relative overflow-hidden group rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-primary/20 p-10 min-h-[220px] flex flex-col justify-between hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 delay-500 fill-mode-both shadow-md">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                <div className="w-32 h-32 bg-primary rounded-full blur-[80px]" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                    <Target className="size-3" />
                                    Luyện trí nhớ
                                </div>
                                <h3 className="text-4xl font-serif font-bold italic tracking-tight text-foreground mb-2">Thẻ nhớ <br /><span className="text-primary not-italic">Flashcards</span></h3>
                                <p className="text-[11px] font-medium text-muted-foreground/60 max-w-[80%] italic leading-relaxed">Hệ thống lặp lại ngắt quãng (SRS) giúp tối ưu hóa khả năng ghi nhớ dài hạn.</p>
                            </div>
                            <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-border/20">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Đồng bộ</span>
                                </div>
                                <Button size="sm" variant="ghost" className="rounded-xl px-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all">
                                    Bắt đầu học <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/exams">
                        <div className="relative overflow-hidden group rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-blue-500/20 p-10 min-h-[220px] flex flex-col justify-between hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 delay-600 fill-mode-both shadow-md">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                <div className="w-32 h-32 bg-blue-500 rounded-full blur-[80px]" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/5 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                    <Award className="size-3" />
                                    Kiểm tra năng lực
                                </div>
                                <h3 className="text-4xl font-serif font-bold italic tracking-tight text-foreground mb-2">Thi thử <br /><span className="text-blue-500 not-italic">JLPT</span></h3>
                                <p className="text-[11px] font-medium text-muted-foreground/60 max-w-[80%] italic leading-relaxed">Các bài thi chuẩn hóa giúp đánh giá trình độ ngôn ngữ chính xác.</p>
                            </div>
                            <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-border/20">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">Sẵn sàng</span>
                                </div>
                                <Button size="sm" variant="ghost" className="rounded-xl px-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500/5 hover:text-blue-500 transition-all">
                                    Làm bài thi <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* AI Sensei Section - Full Width */}
                <div className="w-full">
                    <Link href="/ai-sensei">
                        <div className="relative overflow-hidden group rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-purple-500/20 p-10 min-h-[220px] flex flex-col sm:flex-row justify-between hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 delay-700 fill-mode-both shadow-md gap-6">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                <div className="w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
                            </div>

                            <div className="relative z-10 flex flex-col justify-between flex-1">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/5 text-purple-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                        <Sparkles className="size-3" />
                                        Trợ lý ảo AI
                                    </div>
                                    <h3 className="text-4xl font-serif font-bold italic tracking-tight text-foreground mb-4">Torii <span className="text-purple-500 not-italic">Sensei</span></h3>
                                    <p className="text-[13px] font-medium text-muted-foreground/60 max-w-[90%] italic leading-relaxed">
                                        Học tiếng Nhật với gia sư AI thông minh. Luyện giao tiếp, sửa lỗi ngữ pháp, dịch thuật và tạo bài tập cá nhân hóa ngay lập tức.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 mt-6">
                                    <div className="flex items-center -space-x-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center bg-purple-500 text-white text-[10px] font-bold z-${30 - i * 10}`}>
                                                <Bot className="w-4 h-4" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-500/80">AI đang trực tuyến</span>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col justify-end sm:items-end">
                                <Button size="lg" className="rounded-2xl px-8 h-12 bg-purple-500 text-white hover:bg-purple-600 shadow-xl shadow-purple-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all group-hover:scale-105">
                                    Tr trò chuyện ngay <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Continue Learning */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/5">
                                        <PlayCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-serif font-bold tracking-tight italic">Đang <span className="text-primary not-italic">Học</span></h2>
                                </div>
                                <Link href="/dashboard/my-courses">
                                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-all">
                                        Tất cả khóa học <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid gap-6">
                                {recentCourses.map((course, idx) => (
                                    <Link key={course.id} href={`/courses/${course.slug}/learn`}>
                                        <Card
                                            className="rounded-[2.5rem] border border-border/40 bg-background/40 backdrop-blur-3xl hover:border-primary/40 hover:bg-background/60 transition-all duration-700 group cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-left-4 fill-mode-both"
                                            style={{ animationDelay: `${700 + (idx * 150)}ms` }}
                                        >
                                            <CardContent className="p-8">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                                                    <div className="w-full sm:w-44 h-28 rounded-2xl bg-muted/30 border border-border/20 flex-shrink-0 relative overflow-hidden group-hover:bg-primary/5 transition-all duration-700 shadow-inner">
                                                        {course.thumbnailUrl ? (
                                                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        ) : (
                                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                <BookOpen className="w-8 h-8 text-muted-foreground/20" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700">
                                                            <div className="p-4 rounded-full bg-primary text-white shadow-2xl">
                                                                <PlayCircle className="w-8 h-8" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-4">
                                                        <div>
                                                            <h3 className="text-xl font-serif font-bold text-foreground truncate group-hover:text-primary transition-all duration-500 italic">
                                                                {course.title}
                                                            </h3>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1 italic">Giảng viên: <span className="text-foreground/60">{course.instructor}</span></p>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                                                                <span>Tiến độ học tập</span>
                                                                <span className="text-primary">{course.progress}%</span>
                                                            </div>
                                                            <Progress value={course.progress} className="h-2 bg-primary/5" />
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0">
                                                        <Button size="icon" variant="ghost" className="rounded-2xl w-14 h-14 border border-border/30 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 group-hover:rotate-6 shadow-sm">
                                                            <ChevronRight className="w-6 h-6" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                                {recentCourses.length === 0 && (
                                    <div className="p-8 rounded-[2.5rem] border border-border/40 bg-background/40 backdrop-blur-3xl text-center shadow-sm">
                                        <p className="text-muted-foreground italic">Bạn chưa tham gia khóa học nào.</p>
                                        <Link href="/courses">
                                            <Button variant="outline" className="mt-4 rounded-xl">Khám phá khóa học</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-12">
                        {/* Upcoming Classes */}
                        <div className="space-y-8 p-8 rounded-[3rem] border border-border/30 bg-background/20 backdrop-blur-xl shadow-md">
                            <div className="flex items-center gap-3 px-2">
                                <div className="p-2 rounded-xl bg-orange-500/5">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                </div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Lịch học trực tuyến</h3>
                            </div>
                            <div className="space-y-4">
                                {upcomingClasses.map((classItem) => (
                                    <div key={classItem.id} className="p-6 rounded-[2rem] border border-border/20 bg-background/40 backdrop-blur-md flex items-start gap-5 group cursor-pointer hover:border-orange-500/30 transition-all duration-500 shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-500/5 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                                            <Clock className="w-5 h-5 text-orange-500 group-hover:text-white" />
                                        </div>
                                        <div className="space-y-1.5 min-w-0">
                                            <h4 className="text-sm font-serif font-bold text-foreground group-hover:text-orange-500 transition-colors italic truncate">{classItem.title}</h4>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{classItem.date} • {classItem.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full h-12 rounded-2xl border border-border/30 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity shadow-sm">Xem lịch chi tiết</Button>
                        </div>

                        {/* Weekly Goals */}
                        <div className="space-y-8 p-8 rounded-[3rem] border border-emerald-500/20 bg-emerald-500/[0.04] backdrop-blur-xl shadow-md">
                            <div className="flex items-center gap-3 px-2">
                                <div className="p-2 rounded-xl bg-emerald-500/5">
                                    <Target className="w-4 h-4 text-emerald-500" />
                                </div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Mục tiêu tuần</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="px-2">
                                    <p className="text-lg font-serif font-bold italic text-foreground leading-tight">Lộ trình học tập</p>
                                    <p className="text-[10px] font-medium text-muted-foreground/60 mt-2 italic leading-relaxed">"Hành trình vạn dặm bắt đầu từ một bước chân."</p>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-emerald-500/20">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/60">
                                            <span>Bài học hoàn thành</span>
                                            <span>{statsData?.averageProgress || 0}%</span>
                                        </div>
                                        <Progress value={statsData?.averageProgress || 0} className="h-2 bg-emerald-500/10" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-center text-emerald-500/40">{statsData?.completedCourses || 0} khóa học hoàn thành</p>
                                </div>
                            </div>
                            <Button className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">Tối ưu hóa tập trung</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
