'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Circle, CheckCircle2, PlayCircle, Lock } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'

interface LearningSidebarProps {
    courseTitle: string
    curriculum: any[]
    progress: number
    completedLessons: number
    totalLessons: number
    currentLessonId: string | null
    isOpen: boolean
    onToggle: () => void
    onLessonSelect: (lessonId: string) => void
}

export function LearningSidebar({
    courseTitle,
    curriculum,
    progress,
    completedLessons,
    totalLessons,
    currentLessonId,
    isOpen,
    onToggle,
    onLessonSelect
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
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border/40 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                        Nội dung học
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="rounded-full w-8 h-8 hover:bg-muted/50 transition-all cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Hoàn thành</span>
                        <span className="text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-primary/5" />
                    <p className="text-[10px] text-muted-foreground/60 font-medium">
                        {completedLessons} / {totalLessons} bài học đã xong
                    </p>
                </div>
            </div>

            {/* Curriculum List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                {curriculum.map((module, moduleIndex) => (
                    <div key={module.id || moduleIndex} className="space-y-1">
                        <button
                            onClick={() => toggleSection(moduleIndex)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer text-left group",
                                expandedSections.includes(moduleIndex) ? "bg-muted/40" : "hover:bg-muted/20"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                    expandedSections.includes(moduleIndex) ? "bg-primary/10 text-primary rotate-90" : "bg-muted text-muted-foreground"
                                )}>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <h4 className="font-bold text-foreground text-xs uppercase tracking-tight truncate">
                                        {module.title}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground/60 font-medium">
                                        {module.lessons?.length || 0} bài học
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
                                                'w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all cursor-pointer border border-transparent group relative',
                                                isActive
                                                    ? 'bg-primary/5 text-primary border-primary/10'
                                                    : 'hover:bg-muted/30 text-muted-foreground',
                                                isLocked && 'opacity-50 cursor-not-allowed'
                                            )}
                                        >
                                            <div className="shrink-0 flex items-center justify-center">
                                                {isActive ? (
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full animate-pulse" />
                                                        <PlayCircle className="w-4 h-4 text-primary relative z-10" />
                                                    </div>
                                                ) : isLocked ? (
                                                    <Lock className="w-3.5 h-3.5" />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary/40 transition-colors" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    'text-xs font-bold transition-colors line-clamp-1 truncate',
                                                    isActive ? 'text-primary' : 'text-foreground/80'
                                                )}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 opacity-60">
                                                    <p className="text-[9px] font-bold uppercase tracking-wider">
                                                        {lesson.videoDuration
                                                            ? `${Math.floor(lesson.videoDuration / 60)}:${(lesson.videoDuration % 60).toString().padStart(2, '0')}`
                                                            : 'Video'}
                                                    </p>
                                                    {lesson.completed && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
                                                </div>
                                            </div>

                                            {isActive && (
                                                <div className="w-1 h-5 bg-primary rounded-full" />
                                            )}
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
