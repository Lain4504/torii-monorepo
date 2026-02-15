'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
    Clock,
    GraduationCap,
    ChevronRight,
    Sparkles,
    Loader2,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { courseApi } from '@/apis/services/course-api'
import type { CourseResponseDTO } from '@workspace/schemas'

const formatPrice = (price: number, isFree: boolean) =>
    isFree ? 'Miễn phí' : `${Number(price).toLocaleString('vi-VN')} VNĐ`

export default function LiveClassesPage() {
    const [courses, setCourses] = useState<CourseResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function fetchLiveCourses() {
            try {
                setLoading(true)
                setError(null)
                const data = await courseApi.getByType('live')
                if (!cancelled) setCourses(data ?? [])
            } catch (e) {
                if (!cancelled) setError('Không thể tải danh sách lớp học trực tuyến.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchLiveCourses()
        return () => { cancelled = true }
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-primary/5">
                <div className="container relative z-10 px-4 mx-auto max-w-7xl">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background text-primary text-xs font-bold border border-primary/20 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            <span>Lớp học trực tuyến</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-sans font-extrabold tracking-tight text-foreground leading-tight">
                            Lớp Học Trực Tuyến <br />
                            <span className="text-primary">Tương Tác Real-time</span>
                        </h1>
                        <p className="max-w-2xl text-lg text-muted-foreground mx-auto font-medium">
                            Học trực tiếp cùng giáo viên bản ngữ và chuyên gia. Lộ trình bài bản, cam kết đầu ra JLPT.
                        </p>
                    </div>
                </div>
            </section>

            {/* Courses List */}
            <section className="py-16 container max-w-6xl mx-auto px-4">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                        {error}
                    </div>
                )}
                {courses.length === 0 && !error && (
                    <div className="text-center py-16 text-muted-foreground">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Chưa có lớp học trực tuyến nào.</p>
                        <p className="text-sm mt-1">Vui lòng quay lại sau.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 gap-6">
                    {courses.map((course) => {
                        const instructor = (course as any).instructors?.[0]
                        const level = course.jlptLevel || ''
                        return (
                            <Link
                                href={`/live-classes/${course.slug}`}
                                key={course.id}
                                className="group block"
                            >
                                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    className={cn(
                                                        'rounded-full px-3 py-1 text-xs font-bold border-none',
                                                        level === 'N5' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                                                        level === 'N4' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                                                        level === 'N2' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                                                        level === 'N3' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                                                        level === 'N1' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
                                                        !level && 'bg-muted'
                                                    )}
                                                >
                                                    {level ? `Cấp độ ${level}` : 'Live'}
                                                </Badge>
                                                <span className="text-xs font-bold text-muted-foreground/60">{course.slug}</span>
                                                {course.totalStudents > 0 && (
                                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" /> {course.totalStudents} học viên
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {course.title}
                                                </h3>
                                                <p className="text-muted-foreground mt-2 line-clamp-2">
                                                    {course.shortDescription || course.description || ''}
                                                </p>
                                            </div>
                                            {instructor && (
                                                <div className="flex items-center gap-4 pt-2">
                                                    <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                                                        <AvatarImage src={(instructor as any).avatarUrl} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                            {(instructor as any).displayName?.[0] || 'G'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">
                                                            {(instructor as any).displayName || 'Giảng viên'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(instructor as any).role === 'MAIN' ? 'Giảng viên chính' : 'Giảng viên'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="lg:w-80 shrink-0 flex flex-col justify-between space-y-6 lg:border-l border-border lg:pl-8">
                                            {course.durationWeeks != null && course.durationWeeks > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground flex items-center gap-2">
                                                        <Clock className="w-4 h-4" /> Thời lượng
                                                    </span>
                                                    <span className="font-bold text-foreground">{course.durationWeeks} tuần</span>
                                                </div>
                                            )}
                                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-medium">Học phí trọn gói</p>
                                                    <p className="text-2xl font-bold text-primary">
                                                        {formatPrice(Number(course.price), course.isFree)}
                                                    </p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}
