'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, PlayCircle, FileText, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import type { CurriculumResponse } from '@/lib/api/services/course-api'

interface CourseCurriculumProps {
    curriculum: CurriculumResponse
    courseSlug: string
}

export function CourseCurriculum({ curriculum, courseSlug }: CourseCurriculumProps) {
    const router = useRouter()
    const [openChapters, setOpenChapters] = useState<number[]>([0])

    const toggleChapter = (index: number) => {
        setOpenChapters(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const formatDuration = (seconds?: number) => {
        if (!seconds) return ''
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}:${String(secs).padStart(2, '0')}`
    }

    const handleLessonClick = (lessonId: string, isUnlocked: boolean) => {
        if (isUnlocked) {
            router.push(`/courses/${courseSlug}/learn/lessons/${lessonId}`)
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="text-primary size-6" />
                Nội dung khóa học
            </h3>

            <div className="space-y-3">
                {curriculum.modules.map((module, index) => (
                    <div
                        key={module.id}
                        className="border border-border rounded-xl overflow-hidden bg-card"
                    >
                        <button
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                            onClick={() => toggleChapter(index)}
                        >
                            <span className="font-bold">{module.title}</span>
                            <ChevronDown
                                className={cn(
                                    "size-5 transition-transform",
                                    openChapters.includes(index) && "rotate-180"
                                )}
                            />
                        </button>

                        <div
                            className={cn(
                                "grid transition-all duration-300",
                                openChapters.includes(index)
                                    ? "grid-rows-[1fr]"
                                    : "grid-rows-[0fr]"
                            )}
                        >
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4 space-y-3">
                                    {module.lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg text-sm",
                                                lesson.isUnlocked
                                                    ? "bg-muted/50 hover:bg-muted cursor-pointer"
                                                    : "bg-muted/30 opacity-60"
                                            )}
                                            onClick={() => handleLessonClick(lesson.id, lesson.isUnlocked)}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {lesson.contentType === 'video' ? (
                                                    <PlayCircle className="size-5 text-blue-500 shrink-0" />
                                                ) : (
                                                    <FileText className="size-5 text-green-500 shrink-0" />
                                                )}
                                                <span className="truncate">{lesson.title}</span>
                                                {lesson.isPreview && (
                                                    <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                                                        Xem thử
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {!lesson.isUnlocked && <Lock className="size-4 text-muted-foreground" />}
                                                {lesson.videoDuration && (
                                                    <span className="text-muted-foreground">{formatDuration(lesson.videoDuration)}</span>
                                                )}
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
