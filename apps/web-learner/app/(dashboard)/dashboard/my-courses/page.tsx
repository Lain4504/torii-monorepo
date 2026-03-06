'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { ComponentLoading } from '@workspace/ui/components/component-loading'
import { formatDate } from '@/utils/format-utils';
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@workspace/ui/components/empty'
import {
    Search,
    PlayCircle,
    BookOpen,
    Clock,
    Award,
    TrendingUp,
    ChevronRight,
    Video
} from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LiveSessionBlock } from '@/components/courses/live-session-block'
import { CourseExpirationModal } from '@/components/courses/course-expiration-modal'
import { useMyCourses, useLearningStats, learningProgressApi } from '@/lib/api/services/learning-progress-api'
import { ClassReviewDialog } from '@/components/class-reviews/class-review-dialog'
import { academyClassReviewHooks } from '@/lib/api/services/academy-class-reviews'
import { Star } from 'lucide-react'

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
        classId: string;
        enrollmentId: string;
        courseTitle: string;
        existingReview?: any;
    }>({ isOpen: false, classId: '', enrollmentId: '', courseTitle: '' })

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
                <Spinner className="size-8 text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-4 pb-2 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">
                    Khóa học của tôi
                </h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Tiếp tục hành trình chinh phục kiến thức của bạn. Theo dõi tiến độ và hoàn thành các mục tiêu.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-xl bg-primary/10 text-primary`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-1">{stat.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm khóa học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex bg-muted/50 p-1 rounded-xl">
                    <Button
                        variant={filter === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={filter === 'in-progress' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('in-progress')}
                    >
                        Đang học
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('completed')}
                    >
                        Đã xong
                    </Button>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <Card
                        key={course.id}
                        onClick={() => {
                            if (course.expiresAt && new Date(course.expiresAt) < new Date()) {
                                setExpiredCourse({ title: course.title, slug: course.slug })
                            }
                        }}
                        className="border-border bg-card hover:shadow-lg transition-all group overflow-hidden cursor-pointer flex flex-col h-full rounded-2xl"
                    >
                        <div className="relative aspect-video bg-muted overflow-hidden">
                            {/* Placeholder/Thumb - real image if available */}
                            {course.thumbnailUrl ? (
                                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                    <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-all duration-300 z-10">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all">
                                    <PlayCircle className="w-6 h-6 text-primary fill-current" />
                                </div>
                            </div>

                            {course.progress >= 100 && (
                                <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-none shadow-sm flex gap-1.5 items-center px-2 py-0.5 text-xs font-bold z-20">
                                    <Award className="w-3 h-3" /> Hoàn thành
                                </Badge>
                            )}
                            {course.type === 'live' && (
                                <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none shadow-sm flex gap-1.5 items-center px-2 py-0.5 text-xs font-bold z-20">
                                    <Video className="w-3 h-3" /> Live
                                </Badge>
                            )}
                            {course.expiresAt && new Date(course.expiresAt) < new Date() && (
                                <Badge className="absolute top-3 left-3 bg-destructive text-white border-none shadow-sm flex gap-1.5 items-center px-2 py-0.5 text-xs font-bold z-20">
                                    <Clock className="w-3 h-3" /> Hết hạn
                                </Badge>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10 z-20">
                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                            </div>
                        </div>
                        <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium">{course.instructor || 'Giảng viên Torii'}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                        <span>Tiến độ</span>
                                        <span className="text-primary">{course.progress}%</span>
                                    </div>
                                    <Progress value={course.progress} className="h-2 bg-muted" />
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        {course.completedLessons}/{course.totalLessons} bài
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {course.lastAccessed ? formatDate(course.lastAccessed) : 'Mới'}
                                    </span>
                                </div>
                            </div>

                            {course.type === 'live' && (
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <LiveSessionBlock courseId={course.id} compact maxSessions={2} />
                                </div>
                            )}

                            <div className="pt-2">
                                {course.expiresAt && new Date(course.expiresAt) < new Date() ? (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpiredCourse({ title: course.title, slug: course.slug })
                                        }}
                                        variant="destructive"
                                        className="w-full text-xs"
                                    >
                                        Gia hạn khóa học
                                        <ChevronRight className="ml-1.5 w-3.5 h-3.5" />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/courses/${course.courseRunId}/learn`}
                                            className="w-full flex-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button className="w-full text-xs" variant={course.progress >= 100 ? "outline" : "default"}>
                                                {course.progress === 0 ? 'Bắt đầu học' : course.progress >= 100 ? 'Xem lại' : 'Tiếp tục học'}
                                                <ChevronRight className="ml-1.5 w-3.5 h-3.5" />
                                            </Button>
                                        </Link>
                                        {course.progress >= 100 && (() => {
                                            const existingReview = myReviews.find((r: any) => r.class?.id === course.courseRunId);
                                            return (
                                                <Button
                                                    className={`text-xs shrink-0 flex-1 ${!existingReview && "bg-amber-500 hover:bg-amber-600 text-white"}`}
                                                    variant={existingReview ? "secondary" : "default"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setReviewDialogProps({
                                                            isOpen: true,
                                                            classId: course.courseRunId,
                                                            enrollmentId: course.id,
                                                            courseTitle: course.title,
                                                            existingReview
                                                        });
                                                    }}
                                                >
                                                    <Star className={`mr-1.5 w-3.5 h-3.5 ${existingReview ? 'fill-amber-500 text-amber-500' : ''}`} />
                                                    {existingReview ? 'Sửa đánh giá' : 'Đánh giá'}
                                                </Button>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <Empty>
                    <EmptyMedia variant="icon" className="bg-muted/20">
                        <Search className="size-8 text-muted-foreground/40" />
                    </EmptyMedia>
                    <EmptyContent>
                        <EmptyTitle>Không tìm thấy khóa học</EmptyTitle>
                        <EmptyDescription>Bạn chưa đăng ký khóa học nào hoặc không tìm thấy kết quả phù hợp.</EmptyDescription>
                        <Link href="/dashboard/available-courses">
                            <Button className="mt-4" variant="outline">Khám phá khóa học</Button>
                        </Link>
                    </EmptyContent>
                </Empty>
            )}
            <CourseExpirationModal
                isOpen={!!expiredCourse}
                onClose={() => setExpiredCourse(null)}
                courseTitle={expiredCourse?.title || ''}
                courseSlug={expiredCourse?.slug || ''}
            />

            <ClassReviewDialog
                isOpen={reviewDialogProps.isOpen}
                setIsOpen={(isOpen) => setReviewDialogProps(prev => ({ ...prev, isOpen }))}
                classId={reviewDialogProps.classId}
                enrollmentId={reviewDialogProps.enrollmentId}
                courseTitle={reviewDialogProps.courseTitle}
                existingReview={reviewDialogProps.existingReview}
            />
        </div>
    )
}
