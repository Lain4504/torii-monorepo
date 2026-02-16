'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Circle, CheckCircle2, PlayCircle, Lock } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'
import { LiveSessionBlock } from './live-session-block'

interface LearningSidebarProps {
    courseTitle: string
    curriculum: any[]
    progress: number
    completedLessons: number // Keep for backward compat or just remove if I update usage
    completedLessonIds?: string[]
    totalLessons: number
    currentLessonId: string | null
    isOpen: boolean
    onToggle: () => void
    onLessonSelect: (lessonId: string) => void
    /** When true, show live sessions block with "Vào phòng" */
    courseId?: string
    isLiveCourse?: boolean
}

export function LearningSidebar({
    courseTitle: _courseTitle,
    curriculum,
    progress,
    completedLessons,
    completedLessonIds = [],
    totalLessons,
    currentLessonId,
    isOpen,
    onToggle,
    onLessonSelect,
    courseId,
    isLiveCourse,
}: LearningSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<number[]>([0])

    const toggleSection = (sectionId: number) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-80 lg:relative lg:z-0 border-l border-border/40 bg-background/95 backdrop-blur-xl flex flex-col h-full shrink-0 transition-all duration-300 shadow-2xl lg:shadow-none">
            {/* Simple Sidebar Header */}
            <div className="p-6 border-b border-border/10 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-sans font-bold italic uppercase tracking-widest text-foreground/60">
                        Nội dung học
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="rounded-lg w-8 h-8 text-muted-foreground hover:bg-muted"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Tiến độ khóa học</span>
                        <span className="text-xs font-bold text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-primary/5" />
                    <p className="text-[10px] font-medium text-muted-foreground/30">
                        Đã hoàn thành {completedLessons}/{totalLessons} bài học
                    </p>
                </div>
            </div>

            {isLiveCourse && courseId && (
                <div className="p-4 border-b border-border/40">
                    <LiveSessionBlock courseId={courseId} compact maxSessions={3} />
                </div>
            )}

            {/* Curriculum List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                {curriculum.map((module, moduleIndex) => (
                    <div key={module.id || moduleIndex} className="space-y-1">
                        <button
                            onClick={() => toggleSection(moduleIndex)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer text-left group",
                                expandedSections.includes(moduleIndex)
                                    ? "bg-muted/10"
                                    : "hover:bg-muted/5"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform duration-300 text-muted-foreground/40",
                                    expandedSections.includes(moduleIndex) && "rotate-180 text-primary"
                                )} />
                                <div className="space-y-0.5 overflow-hidden">
                                    <h4 className="font-bold text-foreground text-xs uppercase tracking-tight truncate">
                                        {module.title}
                                    </h4>
                                    <p className="text-[10px] font-medium text-muted-foreground/40">
                                        Chương {moduleIndex + 1} • {module.lessons?.length || 0} bài học
                                    </p>
                                </div>
                            </div>
                        </button>

                        <div className={cn(
                            "overflow-hidden transition-all duration-300 px-1 pt-1",
                            expandedSections.includes(moduleIndex) ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                        )}>
                            <div className="space-y-1">
                                {module.lessons?.map((lesson: any, lessonIndex: number) => {
                                    const isActive = lesson.id === currentLessonId
                                    const isLocked = lesson.locked // Mock field

                                    return (
                                        <button
                                            key={lesson.id || lessonIndex}
                                            disabled={isLocked}
                                            onClick={() => onLessonSelect(lesson.id)}
                                            className={cn(
                                                'w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all cursor-pointer group',
                                                isActive
                                                    ? 'bg-primary/5 text-primary'
                                                    : 'hover:bg-muted/10 text-muted-foreground',
                                                isLocked && 'opacity-30 cursor-not-allowed'
                                            )}
                                        >
                                            <div className="shrink-0">
                                                {isActive ? (
                                                    <PlayCircle className="w-4 h-4 text-primary" />
                                                ) : isLocked ? (
                                                    <Lock className="w-3.5 h-3.5 text-muted-foreground/30" />
                                                ) : (
                                                    <Circle className="w-1.5 h-1.5 fill-muted-foreground/20 text-muted-foreground/20" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    'text-xs font-bold transition-colors line-clamp-1',
                                                    isActive ? 'text-primary' : 'text-foreground/80'
                                                )}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] font-medium text-muted-foreground/40">
                                                        {lesson.videoDuration
                                                            ? `${Math.floor(lesson.videoDuration / 60)}:${(lesson.videoDuration % 60).toString().padStart(2, '0')}`
                                                            : 'Session'}
                                                    </p>
                                                    {(lesson.completed || completedLessonIds.includes(lesson.id)) && (
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500/60" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
