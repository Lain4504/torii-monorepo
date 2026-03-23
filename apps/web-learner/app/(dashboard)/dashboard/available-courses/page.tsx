'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group'
import { Search, Calendar, ChevronDown, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useAcademyClassCatalog } from '@/lib/api/services/academy-course-api'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatNumber } from '@/utils/format-utils'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

function currentMonthParam() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const WEEKDAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function DashboardCoursesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [level, setLevel] = useState<string>('all')
    const searchParams = useSearchParams()
    const typeParam = (searchParams.get('type') ?? '').toLowerCase()
    const [activeTab, setActiveTab] = useState<'live' | 'vod'>(() => (typeParam === 'vod' ? 'vod' : 'live'))

    const month = useMemo(() => currentMonthParam(), [])

    useEffect(() => {
        setActiveTab(typeParam === 'vod' ? 'vod' : 'live')
    }, [typeParam])

    const levelParam = level === 'all' ? undefined : level
    const q = searchQuery.trim() || undefined

    const liveQuery = useAcademyClassCatalog({
        mode: 'LIVE',
        level: levelParam,
        month,
        q,
    })
    const vodQuery = useAcademyClassCatalog({
        mode: 'VOD',
        level: levelParam,
        q,
    })

    const liveItems = liveQuery.data?.items ?? []
    const vodItems = vodQuery.data?.items ?? []

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Khám phá khóa học</h1>
                    <p className="text-muted-foreground mt-1">
                        Chọn trình độ (JLPT), xem lớp Live đang mở đăng ký trong tháng hoặc khóa VOD theo cấp độ.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tên lớp, mã, khóa học..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
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

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'live' | 'vod')} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="live">Lớp Live</TabsTrigger>
                    <TabsTrigger value="vod">Khóa VOD</TabsTrigger>
                </TabsList>

                <TabsContent value="live" className="mt-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Lớp trực tiếp đang mở đăng ký, khai giảng trong tháng {month.replace('-', '/')}.
                    </p>
                    {liveQuery.isLoading ? (
                        <div className="flex justify-center py-16">
                            <Spinner className="h-8 w-8 text-primary" />
                        </div>
                    ) : liveItems.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-muted-foreground text-sm">
                                Không có lớp Live phù hợp. Thử đổi cấp độ hoặc từ khóa tìm kiếm.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {liveItems.map((klass: any) => (
                                <ClassLiveCard key={klass.id} klass={klass} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="vod" className="mt-6 space-y-4">
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
                        <div className="grid gap-4 md:grid-cols-2">
                            {vodItems.map((klass: any) => (
                                <ClassVodCard key={klass.id} klass={klass} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

        </div>
    )
}

function ClassVodCard({ klass }: { klass: any }) {
    const profile = klass.courseProfile
    const thumb = profile?.thumbnailUrl || '/course-placeholder.jpg'
    const title = klass.name || profile?.title || 'Khóa học'
    const level = profile?.level || '—'
    const price = klass.catalogPrice ?? 0

    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
                <div className="relative aspect-video sm:w-44 sm:shrink-0 border-b sm:border-b-0 sm:border-r">
                    <Image src={thumb} alt="" fill className="object-cover" />
                    <div className="absolute top-2 left-2 flex gap-1">
                        <Badge>{level}</Badge>
                        <Badge variant="secondary">VOD</Badge>
                    </div>
                </div>
                <CardContent className="flex-1 p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold leading-snug">{title}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{klass.code}</p>
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
                        <span className="text-lg font-semibold text-primary">{formatNumber(price)} đ</span>
                        <Button size="sm" asChild>
                            <Link href={`/dashboard/available-courses/class/${klass.id}`}>Chi tiết</Link>
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}

function ClassLiveCard({ klass }: { klass: any }) {
    const profile = klass.courseProfile
    const thumb = profile?.thumbnailUrl || '/course-placeholder.jpg'
    const title = klass.name || profile?.title || 'Lớp học'
    const level = profile?.level || '—'
    const price = klass.catalogPrice ?? 0
    const term = klass.term
    const schedules = Array.isArray(klass.liveSchedules) ? klass.liveSchedules : []

    return (
        <Card>
            <CardContent className="p-0">
                <div className="relative aspect-video w-full border-b">
                    <Image src={thumb} alt="" fill className="object-cover" />
                    <div className="absolute top-2 left-2 flex gap-1">
                        <Badge>{level}</Badge>
                        <Badge variant="destructive">LIVE</Badge>
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
                            {klass.liveEnrollment != null ? (
                                <p className="text-xs flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    {klass.liveEnrollment.maxStudents == null
                                        ? `${klass.liveEnrollment.activeEnrollmentCount ?? 0} học viên`
                                        : `${klass.liveEnrollment.activeEnrollmentCount ?? 0}/${klass.liveEnrollment.maxStudents} học viên`}
                                    {klass.liveEnrollment.isFull ? ' — Đã đầy' : ''}
                                </p>
                            ) : null}
                        </CollapsibleContent>
                    </Collapsible>

                    <Separator />

                    <div className="flex items-center justify-between gap-2">
                        <span className="text-lg font-semibold text-primary">{formatNumber(price)} đ</span>
                        <Button size="sm" asChild>
                            <Link href={`/dashboard/available-courses/class/${klass.id}`}>Chi tiết lớp</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
