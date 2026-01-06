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

    const getTotalDuration = () => {
        let totalSeconds = 0
        curriculum.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                if (lesson.videoDuration) {
                    totalSeconds += lesson.videoDuration
                }
            })
        })
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`
    }

    const totalLessons = curriculum.modules.reduce((acc, module) => acc + module.lessons.length, 0)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nội dung khóa học</h2>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span>{curriculum.modules.length} chương</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{totalLessons} bài học</span>
                    {getTotalDuration() && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span>{getTotalDuration()}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {curriculum.modules.map((module, index) => (
                    <div key={module.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
                        <button
                            onClick={() => toggleChapter(index)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white">
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-slate-500 transition-transform duration-200",
                                        openChapters.includes(index) ? "rotate-180" : ""
                                    )}
                                />
                                {module.title}
                            </div>
                            <span className="text-sm text-slate-500 font-medium">
                                {module.lessons.length} bài
                            </span>
                        </button>

                        {openChapters.includes(index) && (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            {lesson.contentType === 'video' ? (
                                                <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                                            )}
                                            <span className={cn(
                                                "text-sm font-medium transition-colors",
                                                lesson.isPreview ? "text-teal-600 dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                                            )}>
                                                {lesson.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {lesson.isPreview && (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                                    Học thử
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-500">
                                                {lesson.isPreview && lesson.videoDuration ? formatDuration(lesson.videoDuration) : <Lock className="w-3 h-3" />}
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
