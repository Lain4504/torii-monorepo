'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Calendar, ArrowRight, ArrowLeft, Star, BookOpen, GraduationCap, CheckCircle2, Sparkles, Video } from 'lucide-react'
import { courseApi } from '@/lib/api/services/course-api'
import { liveSessionApi } from '@/lib/api/services/live-session-api'
import type { CourseResponseDTO } from '@workspace/schemas'
import type { LiveSessionResponseDTO } from '@workspace/schemas'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatCurrency, formatDateTime } from '@/utils/format-utils'

const formatPrice = (price: number, isFree: boolean) =>
    isFree ? 'Miễn phí' : formatCurrency(price)

export default function LiveClassDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = (params?.slug as string) || ''

    const [course, setCourse] = useState<CourseResponseDTO | null>(null)
    const [sessions, setSessions] = useState<LiveSessionResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function fetchData() {
            if (!slug) return
            try {
                setLoading(true)
                setError(null)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (cancelled) return
                if (!courseData) {
                    setLoading(false)
                    notFound()
                    return
                }
                if ((courseData as any).type !== 'live') {
                    setLoading(false)
                    notFound()
                    return
                }
                setCourse(courseData)
                const sessionList = await liveSessionApi.getSessions(courseData.id)
                if (!cancelled) setSessions(sessionList ?? [])
            } catch (e: any) {
                if (!cancelled) {
                    if (e?.response?.status === 404) {
                        setLoading(false)
                        notFound()
                        return
                    }
                    setError('Không thể tải thông tin khóa học.')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchData()
        return () => { cancelled = true }
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !course) {
        if (!course && !loading) notFound()
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <p className="text-destructive">{error || 'Khóa học không tồn tại.'}</p>
            </div>
        )
    }

    const mainInstructor = course.lecturer
    const learningOutcomes = Array.isArray(course.learningOutcomes) ? course.learningOutcomes : []
    const requirements = Array.isArray(course.requirements) ? course.requirements : []
    const upcomingSessions = sessions
        .filter((s) => s.status === 'scheduled' || s.status === 'live')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5)

    const handleEnrollOrPurchase = () => {
        if (course.isFree) {
            router.push(`/courses/${course.slug}`)
            return
        }
        router.push(`/checkout/${course.id}`)
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="sticky top-0 inset-x-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-50 flex items-center px-4 md:px-8">
                <div className="container mx-auto max-w-7xl flex items-center justify-between">
                    <Link
                        href="/live-classes"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Quay lại danh sách lớp</span>
                    </Link>
                    <Badge variant="outline" className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200">
                        Lớp học trực tuyến
                    </Badge>
                </div>
            </header>

            <main className="pt-12">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                        <div className="lg:col-span-8 space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Badge className="rounded-full px-3 py-1 text-xs font-bold bg-emerald-500 text-white border-none">
                                        Cấp độ {course.jlptLevel || 'N/A'}
                                    </Badge>
                                    {course.totalReviews > 0 && (
                                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full text-xs font-bold">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span>{Number(course.averageRating).toFixed(1)}</span>
                                            <span className="text-muted-foreground font-medium ml-1">({course.totalReviews} đánh giá)</span>
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-sans font-extrabold text-foreground tracking-tight leading-tight">
                                    {course.title}
                                </h1>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    {course.description || course.shortDescription || ''}
                                </p>
                                {mainInstructor && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 max-w-xl">
                                        <Avatar className="w-14 h-14 border border-background shadow-sm">
                                            <AvatarImage src={(mainInstructor as any).avatarUrl} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {(mainInstructor as any).displayName?.[0] || 'G'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-lg text-foreground">
                                                {(mainInstructor as any).displayName || 'Giảng viên'}
                                            </p>
                                            <p className="text-xs font-bold text-muted-foreground">
                                                Giảng viên
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {learningOutcomes.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-primary" /> Lợi ích khóa học
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {learningOutcomes.map((item: string, i: number) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all shadow-sm"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-muted-foreground leading-snug pt-1">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {upcomingSessions.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <Video className="w-5 h-5 text-primary" /> Lịch sắp tới
                                    </h3>
                                    <div className="space-y-3">
                                        {upcomingSessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all"
                                            >
                                                <div className="h-10 px-3 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                    {session.status === 'live' ? 'Đang live' : 'Sắp diễn ra'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-foreground truncate">{session.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(session.scheduledAt, 'EEEE, dd/MM/yyyy • HH:mm')} • {session.duration} phút
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {requirements.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-primary" /> Yêu cầu đầu vào
                                    </h3>
                                    <ul className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border">
                                        {requirements.map((req: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <div className="p-8 rounded-3xl border border-border bg-card shadow-xl shadow-black/5 space-y-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tổng học phí</span>
                                            {!course.isFree && (
                                                <Badge variant="secondary" className="text-[10px] font-bold">
                                                    Thanh toán linh hoạt
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-foreground">
                                                {formatPrice(Number(course.price), course.isFree)}
                                            </span>
                                            {!course.isFree && (
                                                <span className="text-xs font-medium text-muted-foreground">/ khóa</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Button
                                            onClick={handleEnrollOrPurchase}
                                            className="w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all bg-primary text-white"
                                        >
                                            {course.isFree ? 'Đăng ký miễn phí' : 'Đăng ký / Mua khóa'}{' '}
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                        {!course.isFree && (
                                            <p className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wide">
                                                Hoàn tiền trong 30 ngày • Bao gồm Chứng nhận
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-5 pt-8 border-t border-border/50">
                                        {course.durationWeeks != null && course.durationWeeks > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4" /> Thời lượng
                                                </span>
                                                <span className="font-bold text-foreground">{course.durationWeeks} tuần</span>
                                            </div>
                                        )}
                                        {sessions.length > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" /> Buổi học
                                                </span>
                                                <span className="font-bold text-foreground">{sessions.length} buổi</span>
                                            </div>
                                        )}
                                        {course.totalStudents > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Star className="w-4 h-4" /> Học viên
                                                </span>
                                                <span className="font-bold text-foreground">{course.totalStudents} học viên</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
