'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, PlayCircle, FileText, Lock, Sparkles, Clock, Layers } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { CurriculumResponse } from '@/api/services/course-api'

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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <Clock className="w-3 h-3" />
                        <span>Curriculum Timeline</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/20 underline-offset-8">
                        Lộ Trình <span className="text-primary not-italic">Đào Tạo</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{curriculum.modules.length} modules</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>{totalLessons} lessons</span>
                        </div>
                        {getTotalDuration() && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{getTotalDuration()}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={toggleAllSections}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors cursor-pointer border-b-2 border-primary/20 pb-1"
                >
                    {allExpanded ? 'Thu gọn tất cả [-]' : 'Mở rộng tất cả [+]'}
                </button>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
                {curriculum.modules.map((module, index) => (
                    <div
                        key={module.id}
                        className={cn(
                            "rounded-[2rem] overflow-hidden border border-border/40 transition-all duration-500",
                            openChapters.includes(index) ? "bg-background shadow-2xl shadow-primary/5" : "bg-muted/10 hover:bg-muted/20"
                        )}
                    >
                        <button
                            onClick={() => toggleChapter(index)}
                            className="w-full flex flex-col md:flex-row md:items-center justify-between p-8 text-left transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                    openChapters.includes(index) ? "bg-primary text-white shadow-lg shadow-primary/20 rotate-0" : "bg-background border border-border/40 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary -rotate-3"
                                )}>
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors">Module 0{index + 1}</p>
                                    <h3 className="text-lg font-black tracking-tight text-foreground uppercase">{module.title}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mt-4 md:mt-0">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                    <span>{module.lessons.length} bài giảng</span>
                                    {module.durationMinutes && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span>{formatDurationMinutes(module.durationMinutes)}</span>
                                        </>
                                    )}
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-muted-foreground transition-all duration-500",
                                        openChapters.includes(index) ? "rotate-180 text-primary" : "group-hover:text-primary"
                                    )}
                                />
                            </div>
                        </button>

                        <div className={cn(
                            "grid transition-all duration-500 ease-in-out",
                            openChapters.includes(index) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}>
                            <div className="overflow-hidden border-t border-border/20">
                                <div className="px-8 pb-8 space-y-2 pt-4">
                                    {module.lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className={cn(
                                                "p-5 rounded-2xl flex items-center justify-between group/lesson transition-all duration-300",
                                                lesson.isPreview ? "bg-primary/[0.03] border border-primary/10 cursor-pointer hover:bg-primary/5" : "bg-muted/20 border border-transparent grayscale select-none"
                                            )}
                                            onClick={() => handleLessonClick(lesson.id, lesson.isPreview)}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                    lesson.isPreview ? "bg-white text-primary shadow-sm group-hover/lesson:bg-primary group-hover/lesson:text-white" : "bg-background text-muted-foreground/40"
                                                )}>
                                                    {lesson.contentType === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className={cn(
                                                        "text-[11px] font-black uppercase tracking-tight transition-colors",
                                                        lesson.isPreview ? "text-foreground" : "text-muted-foreground/60"
                                                    )}>
                                                        {lesson.title}
                                                    </h4>
                                                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                        {lesson.contentType === 'video' ? 'Video Lesson' : 'Learning Material'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {lesson.isPreview && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary">Free Preview</span>
                                                )}
                                                <div className="flex items-center justify-end min-w-[50px]">
                                                    {lesson.isPreview && lesson.videoDuration ? (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{formatDuration(lesson.videoDuration)}</span>
                                                    ) : (
                                                        <Lock className="w-4 h-4 text-muted-foreground/20" />
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
