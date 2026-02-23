'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, PlayCircle, FileText, Lock, Sparkles, Clock, Layers } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@workspace/ui/components/item'
import { cn } from '@workspace/ui/lib/utils'
import type { CurriculumResponse } from '@/lib/api/services/course-api'

interface CourseCurriculumProps {
    curriculum: CurriculumResponse
    courseSlug: string
}

export function CourseCurriculum({ curriculum, courseSlug }: CourseCurriculumProps) {
    const router = useRouter()
    const [openChapters, setOpenChapters] = useState<number[]>([0])
    const [allExpanded, setAllExpanded] = useState(false)

    const toggleChapter = (index: number) => {
        setOpenChapters(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const toggleAllSections = () => {
        if (allExpanded) {
            setOpenChapters([])
        } else {
            setOpenChapters(curriculum.modules.map((_, index) => index))
        }
        setAllExpanded(!allExpanded)
    }

    const formatDuration = (seconds?: number) => {
        if (!seconds) return ''
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}:${String(secs).padStart(2, '0')}`
    }

    const formatDurationMinutes = (minutes?: number) => {
        if (!minutes) return ''
        if (minutes < 60) {
            return `${minutes} phút`
        }
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`
    }

    const getTotalDuration = () => {
        let totalSeconds = 0
        curriculum.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                if (lesson.videoDuration) {
                    totalSeconds += lesson.videoDuration
                }
            })
        })
        const totalMinutes = Math.round(totalSeconds / 60)
        return formatDurationMinutes(totalMinutes)
    }

    const totalLessons = curriculum.modules.reduce((acc, module) => acc + module.lessons.length, 0)

    const handleLessonClick = (lessonId: string, isUnlocked: boolean) => {
        if (isUnlocked) {
            router.push(`/courses/${courseSlug}/learn/lessons/${lessonId}`)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Nội dung khóa học
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                            <Layers className="size-4" />
                            <span>{curriculum.modules.length} chương</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <PlayCircle className="size-4" />
                            <span>{totalLessons} bài học</span>
                        </div>
                        {getTotalDuration() && (
                            <div className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span>{getTotalDuration()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    variant="link"
                    size="sm"
                    onClick={toggleAllSections}
                    className="h-auto p-0 font-bold"
                >
                    {allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                </Button>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
                {curriculum.modules.map((module, index) => (
                    <div
                        key={module.id}
                        className={cn(
                            "rounded-lg overflow-hidden border transition-all",
                            openChapters.includes(index)
                                ? "bg-card shadow-sm"
                                : "bg-muted/30 hover:bg-muted/50"
                        )}
                    >
                        <Button
                            variant="ghost"
                            onClick={() => toggleChapter(index)}
                            className="w-full justify-between h-auto p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "size-10 rounded flex items-center justify-center shrink-0",
                                    openChapters.includes(index)
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <Sparkles className="size-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Chương {index + 1}</p>
                                    <h3 className="text-lg font-bold">{module.title}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                    <span>{module.lessons.length} bài giảng</span>
                                    {module.durationMinutes && (
                                        <span>{formatDurationMinutes(module.durationMinutes)}</span>
                                    )}
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "size-5 text-muted-foreground transition-transform",
                                        openChapters.includes(index) && "rotate-180"
                                    )}
                                />
                            </div>
                        </Button>

                        <div className={cn(
                            "grid transition-all duration-300 ease-in-out",
                            openChapters.includes(index) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}>
                            <div className="overflow-hidden border-t border-border/50">
                                <div className="divide-y p-2">
                                    {module.lessons.map((lesson) => (
                                        <Item
                                            key={lesson.id}
                                            variant="default"
                                            className={cn(
                                                "px-4 py-3",
                                                !lesson.isUnlocked && "opacity-50 pointer-events-none"
                                            )}
                                            onClick={() => handleLessonClick(lesson.id, lesson.isUnlocked)}
                                        >
                                            <ItemMedia>
                                                <div className={cn(
                                                    "size-8 rounded flex items-center justify-center shrink-0",
                                                    lesson.isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {lesson.contentType === 'video' ? <PlayCircle className="size-4" /> : <FileText className="size-4" />}
                                                </div>
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemTitle className="text-sm">
                                                    {lesson.title}
                                                </ItemTitle>
                                                <ItemDescription className="text-xs">
                                                    {lesson.contentType === 'video' ? 'Video' : 'Tài liệu'}
                                                </ItemDescription>
                                            </ItemContent>
                                            <ItemActions>
                                                {lesson.isPreview && (
                                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">Xem thử</span>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    {lesson.isUnlocked && lesson.videoDuration ? (
                                                        <span className="text-xs font-medium text-muted-foreground">{formatDuration(lesson.videoDuration)}</span>
                                                    ) : !lesson.isUnlocked ? (
                                                        <Lock className="size-4 text-muted-foreground" />
                                                    ) : null}
                                                </div>
                                            </ItemActions>
                                        </Item>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
