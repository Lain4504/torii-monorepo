'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group'
import { Calendar, ChevronDown, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useAcademyClassCatalog } from '@/lib/api/services/academy-course-api'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatNumber } from '@/utils/format-utils'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

function currentMonthLabel() {
    const d = new Date()
    return `${d.getMonth() + 2}/${d.getFullYear()}`
}

const WEEKDAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/** Item sau `findPublic` + `normalizePrice` (price / discountPrice đã chuẩn). */
type CatalogListItem = {
    id: string
    code: string
    title?: string
    name?: string
    price: number
    discountPrice: number | null
    courseProfile?: {
        thumbnailUrl?: string | null
        title?: string
        level?: string | null
    } | null
    cohort?: {
        courseProfile?: CatalogListItem['courseProfile']
        startDate?: string | null
        enrollmentOpenAt?: string | null
        name?: string
        code?: string
    } | null
    instructor?: { id: string; displayName: string }
    liveSchedules?: Array<{
        id: string
        weekday: number
        startTime: string
        endTime: string
    }>
    maxStudents?: number | null
    _count?: { enrollments: number }
    term?: { openingDate?: string | null; name?: string; code?: string }
}

function catalogPriceParts(row: Pick<CatalogListItem, 'price' | 'discountPrice'>) {
    const basePrice = row.price
    const d = row.discountPrice
    const hasDiscount = d != null && d > 0 && d < basePrice
    return {
        basePrice,
        displayPrice: hasDiscount ? d : basePrice,
        hasDiscount,
    }
}

export default function DashboardCoursesPage() {
    const [level, setLevel] = useState<string>('all')
    const searchParams = useSearchParams()
    const typeParam = (searchParams.get('type') ?? '').toLowerCase()
    const showLive = typeParam !== 'vod'
    const showVod = typeParam !== 'live'

    const monthLabel = useMemo(() => currentMonthLabel(), [])

    const levelParam = level === 'all' ? undefined : level

    const liveQuery = useAcademyClassCatalog({
        mode: 'LIVE',
        level: levelParam,
        upcomingRegistration: true,
    })
    const vodQuery = useAcademyClassCatalog({
        mode: 'VOD',
        level: levelParam,
    })

    const liveItems = liveQuery.data?.items ?? []
    const vodItems = vodQuery.data?.items ?? []

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Khám phá khóa học</h1>
                    <p className="text-muted-foreground mt-1">
                        Chọn trình độ (JLPT) và khám phá lớp Live đang tuyển sinh trong tháng hiện tại và sắp tới cùng
                        khóa VOD theo cấp độ.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <ToggleGroup
                        type="single"
                        value={level}
                        onValueChange={(v) => v && setLevel(v)}
                        variant="outline"
                        className="justify-start flex-wrap"
                    >
                        <ToggleGroupItem value="all" aria-label="Tất cả cấp">
                            Tất cả
                        </ToggleGroupItem>
                        {LEVELS.map((lv) => (
                            <ToggleGroupItem key={lv} value={lv} aria-label={`Cấp ${lv}`}>
                                {lv}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            </div>

            <div className="space-y-8">
                {showLive ? (
                    <section className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-semibold">Lớp Live đang tuyển sinh</h2>
                            <p className="text-sm text-muted-foreground">
                                Lớp trực tiếp sắp khai giảng trong tháng {monthLabel} và {new Date().getMonth() + 3}/{new Date().getFullYear()}.
                            </p>
                        </div>
                        {liveQuery.isLoading ? (
                            <div className="flex justify-center py-16">
                                <Spinner className="h-8 w-8 text-primary" />
                            </div>
                        ) : liveItems.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                                    Không có lớp Live phù hợp. Thử đổi cấp độ.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory">
                                {liveItems.map((klass: CatalogListItem) => (
                                    <div
                                        key={klass.id}
                                        className="snap-start w-[280px] sm:w-[340px] lg:w-[400px] shrink-0"
                                    >
                                        <ClassLiveCard klass={klass} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ) : null}

                {showVod ? (
                    <section className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-semibold">Khóa VOD</h2>
                            <p className="text-sm text-muted-foreground">Chọn lớp phù hợp theo trình độ.</p>
                        </div>
                        {vodQuery.isLoading ? (
                            <div className="flex justify-center py-16">
                                <Spinner className="h-8 w-8 text-primary" />
                            </div>
                        ) : vodItems.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                                    Không có khóa VOD phù hợp.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory">
                                {vodItems.map((klass: CatalogListItem) => (
                                    <div
                                        key={klass.id}
                                        className="snap-start w-[280px] sm:w-[340px] lg:w-[400px] shrink-0"
                                    >
                                        <ClassVodCard klass={klass} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ) : null}
            </div>

        </div>
    )
}

function ClassVodCard({ klass }: { klass: CatalogListItem }) {
    const profile = klass.courseProfile
    const thumb = profile?.thumbnailUrl || '/course-placeholder.jpg'
    const title = klass.title || klass.name || profile?.title || 'Khóa học'
    const level = profile?.level || '—'
    const { basePrice, displayPrice, hasDiscount } = catalogPriceParts(klass)

    return (
        <Card className="gap-0 py-0">
            <CardContent className="p-0">
                <div className="relative aspect-video w-full border-b border-border bg-muted">
                    <Image src={thumb} alt="" fill className="object-cover" sizes="(max-width: 640px) 280px, 400px" />
                    <div className="absolute top-2 left-2 flex gap-1">
                        <Badge>{level}</Badge>
                        <Badge variant="secondary">VOD</Badge>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold leading-snug">{title}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{klass.code}</p>
                    </div>
                    {klass.instructor?.displayName ? (
                        <p className="text-sm text-muted-foreground">
                            Giảng viên:{' '}
                            <Link
                                href={`/dashboard/instructors/${klass.instructor.id}?name=${encodeURIComponent(klass.instructor.displayName)}`}
                                className="text-foreground underline-offset-4 hover:underline"
                            >
                                {klass.instructor.displayName}
                            </Link>
                        </p>
                    ) : null}

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-primary">{formatNumber(displayPrice)} đ</span>
                            {hasDiscount ? (
                                <span className="text-sm text-muted-foreground line-through">{formatNumber(basePrice)} đ</span>
                            ) : null}
                        </div>
                        <Button size="sm" asChild>
                            <Link href={`/dashboard/available-courses/class/${klass.id}?mode=VOD`}>Chi tiết lớp</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ClassLiveCard({ klass }: { klass: CatalogListItem }) {
    const profile = klass.cohort?.courseProfile ?? klass.courseProfile
    const thumb = profile?.thumbnailUrl || '/course-placeholder.jpg'
    const title = klass.name || profile?.title || 'Lớp học'
    const level = profile?.level || '—'
    const { basePrice, displayPrice, hasDiscount } = catalogPriceParts(klass)
    const term = klass.term ?? (klass.cohort ? {
        openingDate: klass.cohort.startDate ?? klass.cohort.enrollmentOpenAt ?? null,
        name: klass.cohort.name,
        code: klass.cohort.code,
    } : null)
    const schedules = Array.isArray(klass.liveSchedules) ? klass.liveSchedules : []
    const activeCount = klass._count?.enrollments ?? 0
    const maxStudents = klass.maxStudents ?? null
    const liveEnrollment = maxStudents != null || activeCount > 0 ? {
        maxStudents,
        activeEnrollmentCount: activeCount,
        isFull: maxStudents != null ? activeCount >= maxStudents : false,
    } : null

    return (
        <Card className="gap-0 py-0">
            <CardContent className="p-0">
                <div className="relative aspect-video w-full border-b border-border bg-muted">
                    <Image src={thumb} alt="" fill className="object-cover" sizes="(max-width: 640px) 280px, 400px" />
                    <div className="absolute top-2 left-2 flex gap-1">
                        <Badge>{level}</Badge>
                        <Badge variant="destructive">Đang tuyển sinh</Badge>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold leading-snug">{title}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{klass.code}</p>
                    </div>
                    {term?.openingDate ? (
                        <p className="text-sm flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            Khai giảng:{' '}
                            {new Date(term.openingDate).toLocaleDateString('vi-VN')}
                        </p>
                    ) : null}
                    {klass.instructor?.displayName ? (
                        <p className="text-sm text-muted-foreground">
                            Giảng viên:{' '}
                            <Link
                                href={`/dashboard/instructors/${klass.instructor.id}?name=${encodeURIComponent(klass.instructor.displayName)}`}
                                className="text-foreground underline-offset-4 hover:underline"
                            >
                                {klass.instructor.displayName}
                            </Link>
                        </p>
                    ) : null}

                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-between px-0">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    Lịch học & chỗ
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pt-1">
                            {schedules.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Chưa có khung giờ cố định.</p>
                            ) : (
                                <ul className="text-xs space-y-1 border rounded-md p-2 bg-muted/30">
                                    {schedules.map((s: any) => (
                                        <li key={s.id} className="flex justify-between gap-2">
                                            <span>
                                                {WEEKDAY_VI[s.weekday ?? 0] ?? '?'} · {s.startTime}–{s.endTime}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {liveEnrollment != null ? (
                                <p className="text-xs flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    {liveEnrollment.maxStudents == null
                                        ? `${liveEnrollment.activeEnrollmentCount ?? 0} học viên`
                                        : `${liveEnrollment.activeEnrollmentCount ?? 0}/${liveEnrollment.maxStudents} học viên`}
                                    {liveEnrollment.isFull ? ' — Đã đầy' : ''}
                                </p>
                            ) : null}
                        </CollapsibleContent>
                    </Collapsible>

                    <Separator />

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-primary">{formatNumber(displayPrice)} đ</span>
                            {hasDiscount ? (
                                <span className="text-sm text-muted-foreground line-through">{formatNumber(basePrice)} đ</span>
                            ) : null}
                        </div>
                        <Button size="sm" asChild>
                            <Link href={`/dashboard/available-courses/class/${klass.id}?mode=LIVE`}>Chi tiết lớp</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
