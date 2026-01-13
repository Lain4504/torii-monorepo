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
                <h1 className="text-5xl font-serif font-bold text-foreground tracking-tight italic">
                    Chào mừng trở lại, <span className="text-primary not-italic">{user?.displayName || 'Học viên'}</span>
                </h1>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-4 italic border-l-2 border-primary/20 pl-6">
                    Hệ thống vận hành tối ưu. Bạn đã học được <span className="text-foreground">12 giờ</span> trong tuần này.
                </p>
            </div>

            {/* Stats Grid - Ultra Minimal Zen Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={index}
                            className="p-8 rounded-[2.5rem] border border-border/10 bg-background/40 backdrop-blur-3xl group hover:border-primary/30 transition-all duration-700 cursor-default shadow-sm hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3.5 rounded-2xl bg-muted/20 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
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
                    <div className="relative overflow-hidden group rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-primary/10 p-10 min-h-[220px] flex flex-col justify-between hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 delay-500 fill-mode-both">
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <div className="w-32 h-32 bg-primary rounded-full blur-[80px]" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                <Target className="size-3" />
                                Memory Protocol
                            </div>
                            <h3 className="text-4xl font-serif font-bold italic tracking-tight text-foreground mb-2">Neural Memory <br /><span className="text-primary not-italic">Banks</span></h3>
                            <p className="text-[11px] font-medium text-muted-foreground/60 max-w-[80%] italic leading-relaxed">Spaced Repetition System (SRS) active. Enhance long-term retention via cognitive optimization.</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-border/10">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Synchronized</span>
                            </div>
                            <Button size="sm" variant="ghost" className="rounded-xl px-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all">
                                Establish Link <ArrowRight className="ml-2 w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/exams">
                    <div className="relative overflow-hidden group rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-blue-500/10 p-10 min-h-[220px] flex flex-col justify-between hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 delay-600 fill-mode-both">
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <div className="w-32 h-32 bg-blue-500 rounded-full blur-[80px]" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/5 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                <Award className="size-3" />
                                Competency Check
                            </div>
                            <h3 className="text-4xl font-serif font-bold italic tracking-tight text-foreground mb-2">Examination <br /><span className="text-blue-500 not-italic">Protocols</span></h3>
                            <p className="text-[11px] font-medium text-muted-foreground/60 max-w-[80%] italic leading-relaxed">Standardized competency assessments. Validate your linguistic proficiency across JLPT matrices.</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-border/10">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">Grid Online</span>
                            </div>
                            <Button size="sm" variant="ghost" className="rounded-xl px-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500/5 hover:text-blue-500 transition-all">
                                Initiate Grid <ArrowRight className="ml-2 w-3.5 h-3.5" />
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
                                <h2 className="text-2xl font-serif font-bold tracking-tight italic">Active <span className="text-primary not-italic">Learning</span></h2>
                            </div>
                            <Link href="/dashboard/my-courses">
                                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-all">
                                    Global Catalog <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid gap-6">
                            {recentCourses.map((course, idx) => (
                                <Card
                                    key={course.id}
                                    className="rounded-[2.5rem] border border-border/10 bg-background/40 backdrop-blur-3xl hover:border-primary/20 transition-all duration-700 group cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 animate-in fade-in slide-in-from-left-4 fill-mode-both"
                                    style={{ animationDelay: `${700 + (idx * 150)}ms` }}
                                >
                                    <CardContent className="p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                                            <div className="w-full sm:w-44 h-28 rounded-2xl bg-muted/20 border border-border/5 flex-shrink-0 relative overflow-hidden group-hover:bg-primary/5 transition-all duration-700">
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110">
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
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1 italic">Instructor: <span className="text-foreground/60">{course.instructor}</span></p>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                                                        <span>Progress Matrix</span>
                                                        <span className="text-primary">{course.progress}%</span>
                                                    </div>
                                                    <Progress value={course.progress} className="h-2 bg-primary/5" />
                                                </div>
                                            </div>
                                            <div className="flex shrink-0">
                                                <Link href={`/courses/${course.slug}/learn`}>
                                                    <Button size="icon" variant="ghost" className="rounded-2xl w-14 h-14 border border-border/10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 group-hover:rotate-6">
                                                        <ChevronRight className="w-6 h-6" />
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
                <div className="space-y-12">
                    {/* Upcoming Classes */}
                    <div className="space-y-8 p-8 rounded-[3rem] border border-border/10 bg-background/20 backdrop-blur-xl">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 rounded-xl bg-orange-500/5">
                                <Calendar className="w-4 h-4 text-orange-500" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Live Events</h3>
                        </div>
                        <div className="space-y-4">
                            {upcomingClasses.map((classItem) => (
                                <div key={classItem.id} className="p-6 rounded-[2rem] border border-border/5 bg-background/40 backdrop-blur-md flex items-start gap-5 group cursor-pointer hover:border-orange-500/30 transition-all duration-500 shadow-sm">
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
                        <Button variant="ghost" className="w-full h-12 rounded-2xl border border-border/10 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">Schedule Access</Button>
                    </div>

                    {/* Weekly Goals */}
                    <div className="space-y-8 p-8 rounded-[3rem] border border-emerald-500/10 bg-emerald-500/[0.02] backdrop-blur-xl">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 rounded-xl bg-emerald-500/5">
                                <Target className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Zen Goals</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="px-2">
                                <p className="text-lg font-serif font-bold italic text-foreground leading-tight">Mastery Path</p>
                                <p className="text-[10px] font-medium text-muted-foreground/60 mt-2 italic leading-relaxed">"A journey of a thousand miles begins with a single step."</p>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-emerald-500/10">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/60">
                                        <span>Curriculum Units</span>
                                        <span>66%</span>
                                    </div>
                                    <Progress value={66} className="h-2 bg-emerald-500/10" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-center text-emerald-500/40">2/3 Modules Completed</p>
                            </div>
                        </div>
                        <Button className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">Optimize Focus</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
