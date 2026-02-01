'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, PlayCircle, FileText, Lock, Sparkles, Clock, Layers } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { CurriculumResponse } from '@/apis/services/course-api'

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

    const handleLessonClick = (lessonId: string, isPreview: boolean) => {
        if (isPreview) {
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
                            <Layers className="w-4 h-4" />
                            <span>{curriculum.modules.length} chương</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <div className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4" />
                            <span>{totalLessons} bài học</span>
                        </div>
                        {getTotalDuration() && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{getTotalDuration()}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={toggleAllSections}
                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                    {allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                </button>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
                {curriculum.modules.map((module, index) => (
                    <div
                        key={module.id}
                        className={cn(
                            "rounded-2xl overflow-hidden border transition-all duration-300",
                            openChapters.includes(index)
                                ? "bg-card border-border shadow-sm"
                                : "bg-muted/30 border-border/50 hover:bg-muted/50"
                        )}
                    >
                        <button
                            onClick={() => toggleChapter(index)}
                            className="w-full flex flex-col md:flex-row md:items-center justify-between p-6 text-left transition-colors cursor-pointer group gap-4 md:gap-0"
                        >
                            <div className="flex items-start md:items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0",
                                    openChapters.includes(index)
                                        ? "bg-primary/10 text-primary"
                                        : "bg-background border border-border text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                                )}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Chương {index + 1}</p>
                                    <h3 className="text-lg font-bold text-foreground">{module.title}</h3>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pl-14 md:pl-0">
                                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                    <span className="shrink-0">{module.lessons.length} bài giảng</span>
                                    {module.durationMinutes && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                                            <span className="shrink-0">{formatDurationMinutes(module.durationMinutes)}</span>
                                        </>
                                    )}
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0",
                                        openChapters.includes(index) ? "rotate-180 text-primary" : ""
                                    )}
                                />
                            </div>
                        </button>

                        <div className={cn(
                            "grid transition-all duration-300 ease-in-out",
                            openChapters.includes(index) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}>
                            <div className="overflow-hidden border-t border-border/50">
                                <div className="p-4 space-y-2">
                                    {module.lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className={cn(
                                                "p-4 rounded-xl flex items-center justify-between group/lesson transition-all duration-200 gap-3 md:gap-4",
                                                lesson.isPreview
                                                    ? "hover:bg-primary/5 cursor-pointer"
                                                    : "opacity-80 select-none"
                                            )}
                                            onClick={() => handleLessonClick(lesson.id, lesson.isPreview)}
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                    lesson.isPreview ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {lesson.contentType === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className={cn(
                                                        "text-sm font-medium truncate",
                                                        lesson.isPreview ? "text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {lesson.title}
                                                    </h4>
                                                    <span className="text-xs text-muted-foreground">
                                                        {lesson.contentType === 'video' ? 'Video' : 'Tài liệu'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                {lesson.isPreview && (
                                                    <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">Xem thử</span>
                                                )}
                                                <div className="flex items-center justify-end min-w-[40px]">
                                                    {lesson.isPreview && lesson.videoDuration ? (
                                                        <span className="text-xs font-medium text-muted-foreground">{formatDuration(lesson.videoDuration)}</span>
                                                    ) : (
                                                        <Lock className="w-4 h-4 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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
