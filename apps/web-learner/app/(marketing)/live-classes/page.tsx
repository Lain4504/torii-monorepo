'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Clock, GraduationCap, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { courseApi } from '@/apis/services/course-api'
import type { CourseResponseDTO } from '@workspace/schemas'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty'
import { Spinner } from '@workspace/ui/components/spinner'

const formatPrice = (price: number, isFree: boolean) =>
    isFree ? 'Miễn phí' : `${Number(price).toLocaleString('vi-VN')} VNĐ`

const levelColors: Record<string, string> = {
    N5: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    N4: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    N3: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    N2: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    N1: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

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
            } catch {
                if (!cancelled) setError('Không thể tải danh sách lớp học trực tuyến.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchLiveCourses()
        return () => { cancelled = true }
    }, [])

    return (
        <div className="min-h-screen bg-background">
            {/* Page Header */}
            <div className="border-b bg-muted/30">
                <div className="container max-w-7xl mx-auto px-4 py-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            Lớp học trực tuyến
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Lớp Học Trực Tuyến Tương Tác</h1>
                        <p className="text-muted-foreground max-w-xl">
                            Học trực tiếp cùng giáo viên bản ngữ và chuyên gia. Lộ trình bài bản, cam kết đầu ra JLPT.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container max-w-6xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Spinner className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                ) : courses.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><GraduationCap className="w-6 h-6" /></EmptyMedia>
                            <EmptyTitle>Chưa có lớp học nào</EmptyTitle>
                            <EmptyDescription>Vui lòng quay lại sau.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {courses.map((course) => {
                            const instructor = (course as any).instructors?.[0]
                            const level = course.jlptLevel || ''
                            return (
                                <Link
                                    href={`/live-classes/${course.slug}`}
                                    key={course.id}
                                    className="group block"
                                >
                                    <div className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Left: Info */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {level && (
                                                        <Badge className={cn('text-xs border-none', levelColors[level])}>
                                                            Cấp độ {level}
                                                        </Badge>
                                                    )}
                                                    {course.totalStudents > 0 && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3 text-amber-500" />
                                                            {course.totalStudents} học viên
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {course.shortDescription || course.description || ''}
                                                    </p>
                                                </div>

                                                {instructor && (
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={(instructor as any).avatarUrl} />
                                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                                {(instructor as any).displayName?.[0] || 'G'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">{(instructor as any).displayName || 'Giảng viên'}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(instructor as any).role === 'MAIN' ? 'Giảng viên chính' : 'Giảng viên'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Price + Action */}
                                            <div className="lg:w-56 shrink-0 flex flex-col justify-between gap-4 lg:border-l border-border lg:pl-6">
                                                {course.durationWeeks != null && course.durationWeeks > 0 && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" /> Thời lượng
                                                        </span>
                                                        <span className="font-medium">{course.durationWeeks} tuần</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Học phí</p>
                                                        <p className="text-xl font-bold text-primary">
                                                            {formatPrice(Number(course.price), course.isFree)}
                                                        </p>
                                                    </div>
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
