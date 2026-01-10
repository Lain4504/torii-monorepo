'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Clock, PlayCircle, ChevronRight, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function HistoryPage() {
    const historyItems = [
        {
            id: 1,
            courseTitle: 'Tiếng Nhật N5 - Cơ bản',
            lessonTitle: 'Bài 12: Ngữ pháp cơ bản (Phần 2)',
            timestamp: 'Hôm nay, 14:30',
            duration: '45 phút',
            slug: 'tieng-nhat-n5-co-ban'
        },
        {
            id: 2,
            courseTitle: 'Tiếng Nhật N5 - Cơ bản',
            lessonTitle: 'Bài 11: Từ vựng về gia đình',
            timestamp: 'Hôm qua, 20:15',
            duration: '30 phút',
            slug: 'tieng-nhat-n5-co-ban'
        },
        {
            id: 3,
            courseTitle: 'Ngữ pháp N4',
            lessonTitle: 'Bài 5: Thể điều kiện',
            timestamp: '08/01/2026, 09:00',
            duration: '60 phút',
            slug: 'ngu-phap-n4'
        }
    ]

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-4xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Lịch sử học tập</h1>
                <p className="text-sm text-muted-foreground opacity-70">Nhìn lại chặng đường bạn đã đi qua</p>
            </div>

            {/* Timeline List */}
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-border/50">
                {historyItems.map((item) => (
                    <div key={item.id} className="relative pl-12 group">
                        <div className="absolute left-3 top-2 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform z-10" />

                        <Card className="border-border/50 shadow-none bg-card/30 hover:bg-card/50 transition-colors cursor-pointer overflow-hidden border-l-4 border-l-primary/30">
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
import { Button } from '@workspace/ui/components/button'
