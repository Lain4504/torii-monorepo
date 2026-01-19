'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import {
    Search,
    PlayCircle,
    BookOpen,
    Clock,
    Award,
    TrendingUp,
    ChevronRight,
    Sparkles,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { learningProgressApi, type MyCourseResponse, type LearningStats } from '@/apis/services/learning-progress-api'


export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all')
    const [courses, setCourses] = useState<MyCourseResponse[]>([])
    const [statsData, setStatsData] = useState<LearningStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesData, stats] = await Promise.all([
                    learningProgressApi.getMyCourses(),
                    learningProgressApi.getStats()
                ])
                setCourses(coursesData)
                setStatsData(stats)
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter =
            filter === 'all' ||
            (filter === 'in-progress' && course.progress < 100) ||
            (filter === 'completed' && course.progress >= 100)
        return matchesSearch && matchesFilter
    })

    const stats = [
        { label: 'Tổng khóa học', value: statsData?.totalCourses.toString() || '0', icon: BookOpen, color: 'text-blue-500' },
        { label: 'Giờ học', value: statsData?.totalLearningHours.toString() || '0', icon: Clock, color: 'text-primary' },
        { label: 'Đang học', value: statsData?.inProgressCourses.toString() || '0', icon: PlayCircle, color: 'text-orange-500' },
        { label: 'Đã xong', value: statsData?.completedCourses.toString() || '0', icon: Award, color: 'text-emerald-500' },
        { label: 'Tiến độ TB', value: `${statsData?.averageProgress || 0}%`, icon: TrendingUp, color: 'text-purple-500' },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-6 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Sparkles className="w-3 h-3" />
                    <span>Hành trình học tập</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground uppercase italic leading-[0.9] animate-in fade-in slide-in-from-bottom-3 duration-700">
                    Khóa học <span className="text-primary not-italic">Của Tôi</span>
                </h1>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-6 py-1 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    Tiếp tục hành trình chinh phục kiến thức của bạn
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="p-6 rounded-[2rem] border border-border/30 bg-card/40 backdrop-blur-3xl group hover:border-primary/40 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-primary/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl bg-muted/20 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-serif font-bold italic tracking-tighter">{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em] mt-2 italic">{stat.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Tìm khóa học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 bg-muted/20 border-border/60 focus:bg-background transition-all shadow-sm rounded-xl"
                    />
                </div>
                <div className="flex gap-1.5 p-1 rounded-full bg-muted/20 border border-border/60 shadow-sm">
                    <Button
                        variant={filter === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className="rounded-full text-xs font-medium px-4 h-8 transition-all cursor-pointer"
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={filter === 'in-progress' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('in-progress')}
                        className="rounded-full text-xs font-medium px-4 h-8 transition-all cursor-pointer"
                    >
                        Đang học
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('completed')}
                        className="rounded-full text-xs font-medium px-4 h-8 transition-all cursor-pointer"
                    >
                        Đã xong
                    </Button>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="border-border/60 shadow-sm bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-all group overflow-hidden cursor-pointer flex flex-col h-full">
                        <div className="relative aspect-video bg-muted/40 overflow-hidden">
                            {/* Placeholder/Thumb - real image if available */}
                            {course.thumbnailUrl ? (
                                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/20">
                                    <Sparkles className="w-10 h-10 text-muted-foreground/20" />
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/40 backdrop-blur-sm transition-all duration-300 z-10">
                                <PlayCircle className="w-12 h-12 text-primary" />
                            </div>

                            {course.progress >= 100 && (
                                <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-none shadow-sm flex gap-1.5 items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider z-20">
                                    <Award className="w-3 h-3" /> Hoàn thành
                                </Badge>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/5 z-20">
                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                            </div>
                        </div>
                        <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <h3 className="text-xl font-serif font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors italic">
                                    {course.title}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium">{course.instructor || 'Giảng viên Torii'}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                        <span>Tiến độ học</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <Progress value={course.progress} className="h-1.5 bg-primary/5" />
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 uppercase">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        {course.completedLessons}/{course.totalLessons} bài
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString('vi-VN') : 'Mới'}
                                    </span>
                                </div>
                            </div>

                            <Link href={`/courses/${course.slug}/learn`} className="w-full pt-2">
                                <Button variant="outline" className="w-full rounded-full h-9 text-xs font-bold uppercase tracking-widest border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary group/btn transition-all cursor-pointer">
                                    {course.progress === 0 ? 'Bắt đầu học' : course.progress >= 100 ? 'Xem lại' : 'Tiếp tục học'}
                                    <ChevronRight className="ml-1.5 w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-muted/5">
                    <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Không tìm thấy khóa học</h3>
                        <p className="text-sm text-muted-foreground">Bạn chưa đăng ký khóa học nào hoặc không tìm thấy kết quả phù hợp.</p>
                        <Link href="/courses">
                            <Button className="mt-4 rounded-full" variant="outline">Khám phá khóa học</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
