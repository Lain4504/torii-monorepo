'use client'

import { useState } from 'react'
import { ChevronDown, PlayCircle, FileText, Lock } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { CurriculumResponse } from '@/api/services/course-api'

interface CourseCurriculumProps {
    curriculum: CurriculumResponse
}

export function CourseCurriculum({ curriculum }: CourseCurriculumProps) {
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Nội dung khóa học</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{curriculum.modules.length} phần</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span>{totalLessons} bài giảng</span>
                        {getTotalDuration() && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span>{getTotalDuration()} tổng thời lượng</span>
                            </>
                        )}
                    </div>
                </div>
                {curriculum.modules.length > 1 && (
                    <button
                        onClick={toggleAllSections}
                        className="text-sm font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        {allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả các phần'}
                    </button>
                )}
            </div>

            <div className="border rounded-lg overflow-hidden bg-card">
                {curriculum.modules.map((module, index) => (
                    <div key={module.id} className="border-b last:border-0">
                        <button
                            onClick={() => toggleChapter(index)}
                            className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3 font-semibold text-foreground">
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-muted-foreground transition-transform duration-200",
                                        openChapters.includes(index) ? "rotate-180" : ""
                                    )}
                                />
                                {module.title}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <span>{module.lessons.length} bài giảng</span>
                                {module.durationMinutes && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                        <span>{formatDurationMinutes(module.durationMinutes)}</span>
                                    </>
                                )}
                            </div>
                        </button>

                        {openChapters.includes(index) && (
                            <div className="divide-y divide-border">
                                {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-accent transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-3 flex-1">
                                            {lesson.contentType === 'video' ? (
                                                <PlayCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                            )}
                                            <span className={cn(
                                                "text-sm font-medium transition-colors",
                                                lesson.isPreview ? "text-primary" : "text-foreground"
                                            )}>
                                                {lesson.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {lesson.isPreview && (
                                                <button className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                                                    Xem trước
                                                </button>
                                            )}
                                            <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                                                {lesson.isPreview && lesson.videoDuration ? formatDuration(lesson.videoDuration) : <Lock className="w-3 h-3 inline" />}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
