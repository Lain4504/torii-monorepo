'use client'

import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@workspace/ui/components/empty'
import {
    Item,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
    ItemGroup
} from '@workspace/ui/components/item'
import Link from 'next/link'
import { Calendar, BookOpen, Clock, ArrowRight, ChevronRight } from 'lucide-react'

import { useAcademyLearningHistory } from '@/lib/api/services/academy-learning-progress-api'

import { Button } from '@workspace/ui/components/button'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} phút`
}

export default function HistoryPage() {
    const { data: history, isLoading } = useAcademyLearningHistory()

    const historyItems = history?.map(item => ({
        id: item.id,
        courseTitle: item.courseTitle || "Khóa học",
        lessonTitle: item.lessonTitle || "Bài học",
        timestamp: format(new Date(item.timestamp || item.lastAccessedAt), "d MMM, yyyy HH:mm", { locale: vi }),
        duration: "Bản ghi học tập",
        classId: item.classId,
        slug: item.slug,
        isExpired: false // History items don't expire directly
    })) || []

    if (isLoading) {
        return (
            <div className="space-y-10 max-w-4xl">
                <div className="space-y-1">
                    <div className="h-8 w-48 bg-muted/20 animate-pulse rounded-md" />
                    <div className="h-4 w-64 bg-muted/20 animate-pulse rounded-md" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-muted/10 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-2 pb-6 border-b border-border">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Lịch sử học tập
                </h1>
                <p className="text-muted-foreground">
                    Nhìn lại chặng đường phát triển và các bài học bạn đã hoàn thành.
                </p>
            </div>

            {/* List */}
            <ItemGroup>
                {historyItems.map((item) => (
                    <Item key={item.id} variant="outline" className="group">
                        <ItemMedia variant="icon" className="bg-primary/5 text-primary">
                            <Clock className="size-4" />
                        </ItemMedia>
                        <ItemContent>
                            <div className="flex items-center gap-2 mb-0.5">
                                <ItemTitle className="text-base font-semibold">{item.lessonTitle}</ItemTitle>
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded">
                                    {item.duration}
                                </span>
                            </div>
                            <ItemDescription className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <BookOpen className="size-3.5 opacity-60" />
                                    {item.courseTitle}
                                </span>
                                <span className="flex items-center gap-1.5 font-medium tabular-nums opacity-60">
                                    <Calendar className="size-3.5" />
                                    {item.timestamp}
                                </span>
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button asChild variant="ghost" size="icon" className="rounded-full">
                                <Link
                                    href={
                                        item.isExpired
                                            ? `/dashboard/available-courses/${item.slug}`
                                            : `/courses/${item.classId || item.slug}/learn`
                                    }
                                >
                                    {item.isExpired ? <ArrowRight className="size-4" /> : <ChevronRight className="size-4" />}
                                </Link>
                            </Button>
                        </ItemActions>
                    </Item>
                ))}
            </ItemGroup>

            {historyItems.length === 0 && (
                <Empty className="py-20 border-2 border-dashed rounded-2xl">
                    <EmptyMedia variant="icon" className="bg-muted/30">
                        <Clock className="size-8 text-muted-foreground/40" />
                    </EmptyMedia>
                    <EmptyContent>
                        <EmptyTitle>Chưa có lịch sử học tập</EmptyTitle>
                        <EmptyDescription>Bắt đầu học một bài hổi ngay để ghi lại tiến trình của bạn.</EmptyDescription>
                    </EmptyContent>
                    <Button asChild variant="secondary" className="mt-4">
                        <Link href="/dashboard/available-courses">Khám phá khóa học</Link>
                    </Button>
                </Empty>
            )}
        </div>
    )
}
