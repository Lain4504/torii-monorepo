'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Clock, PlayCircle, ChevronRight, Calendar, BookOpen, History } from 'lucide-react'
import Link from 'next/link'

import { useLearningHistory } from '../../../../apis/services/learning-progress-api'
import { Button } from '@workspace/ui/components/button'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} phút`
}

export default function HistoryPage() {
    const { data: history, isLoading } = useLearningHistory()

    const historyItems = history?.map(item => ({
        id: item.id,
        courseTitle: item.courseTitle,
        lessonTitle: item.lessonTitle,
        timestamp: format(new Date(item.timestamp), "d MMM, yyyy HH:mm", { locale: vi }),
        duration: formatDuration(item.duration),
        slug: item.slug
    })) || []

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-4xl">
                <div className="space-y-1">
                    <div className="h-8 w-48 bg-muted/20 animate-pulse rounded-md" />
                    <div className="h-4 w-64 bg-muted/20 animate-pulse rounded-md" />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-muted/10 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-4xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-sans font-bold italic uppercase tracking-wide">
                    <History className="size-3.5" />
                    Archive
                </div>
                <h1 className="text-3xl md:text-4xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                    Lịch sử <span className="text-primary not-italic">Học tập</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                    Nhìn lại chặng đường phát triển Torii Learner
                </p>
            </div>

            {/* Timeline List */}
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-border/50">
                {historyItems.map((item) => (
                    <div key={item.id} className="relative pl-12 group">
                        <div className="absolute left-3 top-2 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform z-10" />

                        <Card className="border-border/60 shadow-sm bg-card/40 backdrop-blur-md hover:bg-card/50 transition-colors cursor-pointer overflow-hidden border-l-4 border-l-primary/40">
                            <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                                            <Calendar className="w-3 h-3" />
                                            <span>{item.timestamp}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground">{item.lessonTitle}</h3>
                                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            {item.courseTitle}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-border/20 pt-3 md:pt-0">
                                        <div className="text-right">
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                <Clock className="w-3 h-3" />
                                                {item.duration}
                                            </span>
                                        </div>
                                        <Link href={`/courses/${item.slug}/learn`}>
                                            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hover:bg-primary/5 hover:text-primary cursor-pointer transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {historyItems.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground font-medium">Chưa có lịch sử học tập</p>
                </div>
            )}
        </div>
    )
}
