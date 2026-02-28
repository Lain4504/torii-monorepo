'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
    Calendar, GraduationCap, SlidersHorizontal, Users,
    ChevronDown, Clock, Tag, ChevronRight, AlertCircle
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { courseApi } from '@/lib/api/services/course-api'
import type { CourseResponseDTO } from '@workspace/schemas'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatCurrency } from '@/utils/format-utils'

type Tab = 'upcoming' | 'past'

function isUpcoming(course: CourseResponseDTO): boolean {
    if (!course.startDate) return true // no date → treat as upcoming/open
    return new Date(course.startDate).getTime() > Date.now()
}

function formatDate(d: string | Date | undefined | null): string {
    if (!d) return ''
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatPrice(price: number, isFree: boolean, discountPrice?: number | null): string {
    if (isFree) return 'Miễn phí'
    if (discountPrice && discountPrice > 0 && discountPrice < price) return formatCurrency(discountPrice)
    return formatCurrency(price)
}

function RegistrationStatus({ course }: { course: CourseResponseDTO }) {
    const regClosed = course.registrationClosedAt ? new Date(course.registrationClosedAt) : null
    const now = new Date()
    const isClosed = regClosed && regClosed < now

    if (isClosed) return (
        <span className="text-xs font-bold text-red-500 flex items-center gap-1">
            <AlertCircle className="size-3 shrink-0" />
            Hết hạn đăng ký
        </span>
    )
    if (regClosed) {
        const diffDays = Math.ceil((regClosed.getTime() - now.getTime()) / 86400000)
        return (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="size-3 shrink-0" />
                Đóng đăng ký sau {diffDays} ngày
            </span>
        )
    }
    return (
        <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Đang nhận đăng ký
        </span>
    )
}

export default function LiveClassesPage() {
    const [courses, setCourses] = useState<CourseResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>('upcoming')
    const [levelFilter, setLevelFilter] = useState<string>('all')
    const [visibleCount, setVisibleCount] = useState(6)

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

    const levels = ['all', ...Array.from(new Set(courses.map(c => c.jlptLevel).filter(Boolean)))]

    const filteredCourses = courses.filter((c) => {
        const tabOk = activeTab === 'past' ? !isUpcoming(c) : isUpcoming(c)
        const levelOk = levelFilter === 'all' || c.jlptLevel === levelFilter
        return tabOk && levelOk
    })
    const visibleCourses = filteredCourses.slice(0, visibleCount)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Lớp Học Trực Tuyến
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Học trực tiếp qua WebRTC cùng giáo viên bản ngữ — lịch học cố định, cam kết đầu ra JLPT
                    </p>
                </div>
                {/* Level filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal className="size-4 text-slate-400 shrink-0" />
                    {levels.map(lv => (
                        <button
                            key={lv}
                            onClick={() => { setLevelFilter(lv); setVisibleCount(6) }}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                                levelFilter === lv
                                    ? 'bg-[#ec5b13] text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            )}
                        >
                            {lv === 'all' ? 'Tất cả' : lv}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8">
                <button
                    onClick={() => { setActiveTab('upcoming'); setVisibleCount(6) }}
                    className={cn(
                        'pb-4 text-sm font-medium transition-colors',
                        activeTab === 'upcoming'
                            ? 'font-bold text-[#ec5b13] border-b-2 border-[#ec5b13]'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                >
                    Khoá sắp khai giảng
                </button>
                <button
                    onClick={() => { setActiveTab('past'); setVisibleCount(6) }}
                    className={cn(
                        'pb-4 text-sm font-medium transition-colors',
                        activeTab === 'past'
                            ? 'font-bold text-[#ec5b13] border-b-2 border-[#ec5b13]'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                >
                    Đã khai giảng
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Spinner className="w-8 h-8 animate-spin text-[#ec5b13]" />
                </div>
            ) : error ? (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
            ) : filteredCourses.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><GraduationCap className="w-6 h-6" /></EmptyMedia>
                        <EmptyTitle>Chưa có lớp học nào</EmptyTitle>
                        <EmptyDescription>Vui lòng quay lại sau.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleCourses.map((course) => {
                            const instructor = course.lecturer as any
                            const thumbnail = course.thumbnailUrl || ''
                            const price = formatPrice(Number(course.price), course.isFree, course.discountPrice)
                            const hasDiscount = !course.isFree && course.discountPrice && Number(course.discountPrice) > 0 && Number(course.discountPrice) < Number(course.price)
                            const slotsLeft = course.maxStudents && course.maxStudents > 0
                                ? course.maxStudents - (course.totalStudents ?? 0)
                                : null
                            const regClosed = course.registrationClosedAt
                                ? new Date(course.registrationClosedAt) < new Date()
                                : false

                            return (
                                <div
                                    key={course.id}
                                    className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#ec5b13]/30 transition-all flex flex-col"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                        {thumbnail ? (
                                            <img src={thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <GraduationCap className="size-12 text-slate-300 dark:text-slate-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                            {course.jlptLevel && (
                                                <span className="bg-[#ec5b13]/90 text-white text-xs font-bold px-2 py-0.5 rounded">
                                                    {course.jlptLevel}
                                                </span>
                                            )}
                                            {slotsLeft !== null && slotsLeft <= 5 && slotsLeft > 0 && (
                                                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                                    Còn {slotsLeft} chỗ
                                                </span>
                                            )}
                                            {slotsLeft === 0 && (
                                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                                    Hết chỗ
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 flex flex-col flex-1 gap-4">
                                        {/* Title */}
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold line-clamp-2 text-slate-900 dark:text-slate-100">
                                                {course.title}
                                            </h3>
                                            {course.shortDescription && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                    {course.shortDescription}
                                                </p>
                                            )}
                                        </div>

                                        {/* Instructor */}
                                        {instructor && (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6 border border-slate-200 dark:border-slate-700 shrink-0">
                                                    <AvatarImage src={instructor.avatarUrl} />
                                                    <AvatarFallback className="bg-[#ec5b13]/10 text-[#ec5b13] text-[10px] font-bold">
                                                        {instructor.displayName?.[0] || 'G'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                                                    {instructor.displayName || 'Giảng viên'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Meta row */}
                                        <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                                            {course.startDate && (
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <Calendar className="size-3.5 shrink-0 text-[#ec5b13]" />
                                                    <span>Khai giảng: <span className="font-semibold">{formatDate(course.startDate)}</span></span>
                                                </div>
                                            )}
                                            {course.durationWeeks && (
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <Clock className="size-3.5 shrink-0 text-[#ec5b13]" />
                                                    <span>Thời lượng: <span className="font-semibold">{course.durationWeeks} tuần</span></span>
                                                </div>
                                            )}
                                            {course.maxStudents && course.maxStudents > 0 && (
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <Users className="size-3.5 shrink-0 text-[#ec5b13]" />
                                                    <span>
                                                        {course.totalStudents ?? 0}/{course.maxStudents} học viên
                                                    </span>
                                                </div>
                                            )}
                                            <RegistrationStatus course={course} />
                                        </div>

                                        {/* Price + CTA */}
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xl font-black text-[#ec5b13]">{price}</p>
                                                {hasDiscount && (
                                                    <p className="text-xs text-slate-400 line-through">
                                                        {formatCurrency(Number(course.price))}
                                                    </p>
                                                )}
                                            </div>
                                            <Link
                                                href={`/live-classes/${course.slug}`}
                                                className={cn(
                                                    'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                                                    regClosed
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed pointer-events-none'
                                                        : 'bg-[#ec5b13] text-white hover:bg-[#ec5b13]/90 hover:shadow-lg hover:shadow-[#ec5b13]/20'
                                                )}
                                            >
                                                {regClosed ? 'Đã đóng' : 'Xem chi tiết'}
                                                {!regClosed && <ChevronRight className="size-4" />}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Load more */}
                    {visibleCount < filteredCourses.length && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => setVisibleCount(v => v + 6)}
                                className="flex items-center gap-2 text-slate-500 font-medium hover:text-[#ec5b13] transition-colors"
                            >
                                Xem thêm
                                <ChevronDown className="size-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
